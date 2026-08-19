# 🌊 Agrupación Argentina Azul - Sitio Web

Sitio web de la Agrupación Argentina Azul, movimiento de militancia por la conciencia marítima argentina.

## 🚀 Tecnologías

- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **CSS3** - Estilos puros sin frameworks
- **Google Fonts** - Belleza + Nunito

## 🎨 Características

✅ Diseño moderno y minimalista  
✅ Animaciones suaves al scroll  
✅ Logo animado en navbar  
✅ Completamente responsive  
✅ Optimizado para performance  
✅ Listo para deploy en Netlify  

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🗄️ CMS Autoadministrable (Firebase)

El equipo (Home y Acuicultura), el blog y la sección de inversión "Invertí en Tu Futuro Productivo" son autoadministrables desde un panel `/admin`, sin necesidad de tocar código ni redeployar. No hay backend propio: el sitio (público y panel) habla directo con Firebase (Firestore, Cloud Storage, Authentication) usando el SDK cliente. La autorización y la validación de imágenes viven en las Security Rules (`firebase/firestore.rules` y `firebase/storage.rules`), no en un servidor. Detalle completo de la arquitectura en [`specs/001-cms-autoadministrable/plan.md`](../specs/001-cms-autoadministrable/plan.md) y [`research.md`](../specs/001-cms-autoadministrable/research.md).

### Variables de entorno

Copiá `.env.example` a `.env.local` (no versionado) y completá con los valores del proyecto de Firebase:

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_APP_ID=...
# "true" para conectar contra los emuladores locales en vez del proyecto real
VITE_USE_FIREBASE_EMULATORS=false
```

Estos valores **no son secretos** (es el modelo estándar del SDK cliente de Firebase): la seguridad real la dan las Security Rules, no la confidencialidad de la config. Aun así, `.env.local` no se versiona por prolijidad.

En producción (Netlify), estas mismas variables se cargan en **Site settings → Environment variables** del sitio en Netlify — `netlify.toml` no las declara porque no son parte del build command, son config runtime que Vite embebe en el bundle al buildear.

### Reglas e índices de Firebase

Viven como configuración declarativa en `firebase/` (raíz del repo, no dentro de `repo/`), no como un servicio desplegable:

```bash
cd firebase
firebase use <PROJECT_ID>
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

Para desarrollo contra emuladores en vez del proyecto real:

```bash
firebase emulators:start --only firestore,storage,auth
```

### Acceso al panel `/admin`

- Hay un único usuario administrador, creado manualmente en la consola de Firebase → Authentication (email/password). Su UID está hardcodeado en `firebase/firestore.rules` y `firebase/storage.rules` (`isAdmin()`), así que **si se recrea el usuario, hay que actualizar el UID en ambos archivos y redesplegar las reglas**.
- Login en `http://localhost:5173/admin` (dev) o `https://<dominio>/admin` (producción). No hay flujo de "olvidé mi contraseña" en el panel — es una decisión explícita del spec (un único admin, bajo volumen de uso).
- **Reseteo manual de contraseña**: consola de Firebase → Authentication → Users → seleccionar el usuario → "Reset password" (envía un email al admin), o cambiarla directo desde ahí. El UID del usuario no cambia al resetear la contraseña, así que las Security Rules no necesitan tocarse.
- Secciones administrables desde `/admin`: equipo del Home (`/admin/equipo-home`), equipo de Acuicultura (`/admin/equipo-acuicultura`), blog (`/admin/blog`) e inversión (`/admin/inversion`).

### Dominios autorizados

Para que el login funcione, el dominio de producción (Netlify) y `localhost` deben estar en Firebase Authentication → Settings → **Authorized domains**.

## 🌐 Deploy en Netlify

### Opción 1: Deploy automático desde Git

1. Subí el proyecto a GitHub
2. Conectá el repositorio en Netlify
3. Netlify detectará automáticamente la configuración desde `netlify.toml`

### Opción 2: Deploy manual

```bash
# Build del proyecto
npm run build

# Arrastrá la carpeta /dist a Netlify
```

### Configuración incluida

El archivo `netlify.toml` ya está configurado con:
- Redirects para SPA
- Build command
- Publish directory
- Node version

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Navbar.jsx          # Navegación con logo animado
│   ├── Hero.jsx            # Hero section con estadísticas
│   ├── About.jsx           # ¿Qué es Argentina Azul?
│   ├── Impact.jsx          # ¿Por qué importa?
│   ├── CallToAction.jsx    # CTA para unirse
│   └── Footer.jsx          # Footer con links
├── App.jsx                 # Componente principal
├── App.css                 # Estilos globales
├── index.css               # Variables y reset CSS
└── main.jsx                # Entry point
```

## 🎨 Paleta de Colores

- **Navy**: `#1d385e` - Color principal
- **Blue**: `#5c9dcb` - Acentos y hover
- **White**: `#FFFFFF` - Fondo y texto

## 🔤 Tipografías

- **Belleza** - Títulos display (elegante, serifa)
- **Nunito** - Cuerpo de texto (moderna, sans-serif)

## 📱 Responsive

El sitio está optimizado para:
- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🌊 Elementos Decorativos

- Olas animadas en hero y secciones
- Logo con animación al scroll
- Transiciones suaves en hover
- Animaciones de entrada con Intersection Observer

## 🔗 Links Importantes

- [Fundación Argentina Azul](https://fundacionargentinaazul.org)
- [Instagram](https://www.instagram.com/fundacionargentinaazul/)
- [Facebook](https://www.facebook.com/fundacionargentinaazul)

## 📄 Licencia

© 2025 Agrupación Argentina Azul. Todos los derechos reservados.
