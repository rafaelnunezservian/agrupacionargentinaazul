/**
 * Comparación visual del blog contra el diseño de referencia (T045, SC-004).
 *
 * Levanta Chromium con Playwright y, para cada viewport (mobile / tablet /
 * desktop), captura y mide en paralelo:
 *   - el port React      → http://localhost:5173/blog y /blog/<slug>
 *   - la referencia Hexo → http://localhost:4000/ y una página de post
 *
 * Compara lo que SC-004 pide del hero y del detalle: estructura, jerarquía
 * tipográfica, espaciado y comportamiento (olas, navbar al hacer scroll). El
 * listado de entradas queda excluido de la comparación por FR-020a.
 *
 * Requiere los dos servidores corriendo:
 *   npm run dev --prefix repo
 *   cd Blog/hexo-theme-livemylife-master/hexo-theme-livemylife-master
 *   node node_modules/hexo/bin/hexo server -p 4000
 *
 * Uso:
 *   node repo/scripts/blog-visual-check.mjs [--slug mi-entrada] [--out DIR]
 *                                           [--react URL] [--reference URL]
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
};

const REACT_BASE = getArg('react', 'http://localhost:5173');
const REFERENCE_BASE = getArg('reference', 'http://localhost:4000');
const REFERENCE_POST_PATH = getArg('reference-post', '/en/Hexo-Theme-LiveMyLife/');
const OUT_DIR = path.resolve(getArg('out', path.join(process.cwd(), 'scripts', 'visual-check-output')));

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

/**
 * Mide en la página abierta lo que SC-004 compara: caja y tipografía del
 * hero, presencia y animación de las olas, y estado de la barra de navegación
 * antes y después de hacer scroll. Los selectores se pasan por parámetro
 * porque el port y la referencia usan nombres de clase distintos.
 */
async function measure(page, selectors) {
  return page.evaluate((sel) => {
    const box = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top + window.scrollY),
      };
    };
    const type = (element) => {
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        fontSize: style.fontSize,
        fontFamily: style.fontFamily.split(',')[0].replace(/["']/g, ''),
        lineHeight: style.lineHeight,
        color: style.color,
      };
    };

    const hero = document.querySelector(sel.hero);
    const heroTitle = document.querySelector(sel.heroTitle);
    const waves = document.querySelector(sel.waves);
    const navbar = document.querySelector(sel.navbar);
    const bodyText = document.querySelector(sel.bodyText);

    const waveUses = waves ? Array.from(waves.querySelectorAll('use')) : [];

    return {
      hero: box(hero),
      heroPadding: hero
        ? (() => {
            const heading = document.querySelector(sel.heroHeading);
            if (!heading) return null;
            const style = getComputedStyle(heading);
            return { top: style.paddingTop, bottom: style.paddingBottom };
          })()
        : null,
      heroTitle: type(heroTitle),
      heroTitleText: heroTitle?.textContent?.trim().slice(0, 80) ?? null,
      waves: waves
        ? {
            ...box(waves),
            traces: waveUses.length,
            animations: waveUses.map((use) => {
              const style = getComputedStyle(use);
              return `${style.animationDuration}/${style.animationDelay}`;
            }),
          }
        : null,
      navbar: navbar
        ? {
            ...box(navbar),
            position: getComputedStyle(navbar).position,
            background: getComputedStyle(navbar).backgroundColor,
          }
        : null,
      bodyText: type(bodyText),
      bodyBox: box(bodyText),
      documentHeight: Math.round(document.documentElement.scrollHeight),
    };
  }, selectors);
}

/** Repite la medición de la barra tras bajar y volver a subir, que es cuando el theme la despega. */
async function measureNavbarOnScroll(page, navbarSelector) {
  const read = () =>
    page.evaluate((selector) => {
      const navbar = document.querySelector(selector);
      if (!navbar) return null;
      const style = getComputedStyle(navbar);
      return {
        position: style.position,
        background: style.backgroundColor,
        transform: style.transform,
        classes: navbar.className,
      };
    }, navbarSelector);

  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(500);
  const afterScrollDown = await read();

  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  const afterScrollUp = await read();

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  return { afterScrollDown, afterScrollUp };
}

const REACT_SELECTORS = {
  hero: '.blog-hero',
  heroHeading: '.blog-hero-site-heading, .blog-hero-post-heading',
  heroTitle: '.blog-hero h1',
  waves: '.blog-hero-waves',
  navbar: '.blog-navbar',
  bodyText: '.blog-post-body p, .blog-page-grid',
};

const REFERENCE_SELECTORS = {
  hero: 'header.intro-header',
  heroHeading: '.site-heading, .post-heading',
  heroTitle: '.intro-header h1',
  waves: '.preview-waves',
  navbar: 'nav.navbar-custom',
  bodyText: '.post-container p, .post-preview',
};

async function capture(context, { url, name, viewport, selectors, checkNavbar }) {
  const page = await context.newPage();
  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  const result = { url, screenshot: null, metrics: null, navbarOnScroll: null, error: null };

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Deja asentar los datos de Firestore y arrancar la animación de olas.
    await page.waitForTimeout(1500);

    const file = path.join(OUT_DIR, `${viewport.name}-${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    result.screenshot = file;

    result.metrics = await measure(page, selectors);
    if (checkNavbar) {
      result.navbarOnScroll = await measureNavbarOnScroll(page, selectors.navbar);
    }
  } catch (error) {
    result.error = error.message;
  } finally {
    await page.close();
  }

  return result;
}

/** Descubre el slug de la primera entrada publicada del listado del port. */
async function detectSlug(context) {
  const explicit = getArg('slug', null);
  if (explicit) return explicit;

  const page = await context.newPage();
  try {
    await page.goto(`${REACT_BASE}/blog`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    const href = await page.getAttribute('.blog-page-grid a', 'href');
    return href ? href.replace('/blog/', '') : null;
  } catch {
    return null;
  } finally {
    await page.close();
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });

  const slug = await detectSlug(context);
  if (!slug) {
    console.warn('⚠️  No se encontró ninguna entrada publicada en el listado: se compara solo el hero de /blog.');
  }

  const report = { reactBase: REACT_BASE, referenceBase: REFERENCE_BASE, slug, viewports: {} };

  for (const viewport of VIEWPORTS) {
    const targets = [
      {
        name: 'listado-port',
        url: `${REACT_BASE}/blog`,
        selectors: REACT_SELECTORS,
        checkNavbar: true,
      },
      {
        name: 'listado-referencia',
        url: `${REFERENCE_BASE}/`,
        selectors: REFERENCE_SELECTORS,
        checkNavbar: true,
      },
    ];

    if (slug) {
      targets.push(
        {
          name: 'detalle-port',
          url: `${REACT_BASE}/blog/${slug}`,
          selectors: REACT_SELECTORS,
          checkNavbar: true,
        },
        {
          name: 'detalle-referencia',
          url: `${REFERENCE_BASE}${REFERENCE_POST_PATH}`,
          selectors: REFERENCE_SELECTORS,
          checkNavbar: true,
        }
      );
    }

    const results = await Promise.all(targets.map((target) => capture(context, { ...target, viewport })));
    report.viewports[viewport.name] = Object.fromEntries(
      targets.map((target, index) => [target.name, results[index]])
    );

    console.log(`\n=== ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
    for (const [index, target] of targets.entries()) {
      const result = results[index];
      if (result.error) {
        console.log(`  ${target.name}: ERROR — ${result.error}`);
        continue;
      }
      const { hero, heroTitle, waves, navbar, heroPadding } = result.metrics;
      console.log(
        `  ${target.name.padEnd(22)} hero=${hero ? `${hero.width}x${hero.height}` : '—'}` +
          ` pad=${heroPadding ? `${heroPadding.top}/${heroPadding.bottom}` : '—'}` +
          ` h1=${heroTitle ? `${heroTitle.fontSize} ${heroTitle.fontFamily}` : '—'}` +
          ` olas=${waves ? `${waves.traces} trazos ${waves.height}px` : 'AUSENTES'}` +
          ` nav=${navbar ? navbar.position : '—'}`
      );
    }
  }

  await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nCapturas y métricas en: ${OUT_DIR}`);

  await context.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
