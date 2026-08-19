import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'blogSettings';
const DOC_ID = 'design';

/**
 * Valores por defecto de los ajustes visuales del blog. Se usan cuando el
 * documento todavía no existe (o no se pudo leer), para que `/blog` y
 * `/blog/:slug` rendericen igual en vez de romperse (FR-021).
 */
export const DEFAULT_BLOG_SETTINGS = {
  heroImageUrl: null,
  president: { title: 'Sobre el presidente', name: '', text: '', photoUrl: null },
  coordinator: { title: 'Sobre el coordinador', name: '', text: '', photoUrl: null },
};

const withDefaults = (data) => ({
  heroImageUrl: data?.heroImageUrl ?? null,
  president: { ...DEFAULT_BLOG_SETTINGS.president, ...(data?.president ?? {}) },
  coordinator: { ...DEFAULT_BLOG_SETTINGS.coordinator, ...(data?.coordinator ?? {}) },
});

/**
 * Trae el documento singleton con la imagen del banner de `/blog` y los dos
 * bloques fijos del sidebar del detalle. Nunca devuelve `null`: si no hay
 * documento cargado, devuelve los valores por defecto.
 */
export async function getBlogSettings() {
  const snapshot = await getDoc(doc(db, COLLECTION, DOC_ID));
  return withDefaults(snapshot.exists() ? snapshot.data() : null);
}

/**
 * Crea o actualiza el documento singleton. `setDoc` con `merge: true` cubre
 * el alta y la edición sin necesitar saber si ya existía (mismo patrón que
 * `investment.js`).
 */
export async function saveBlogSettings(data) {
  await setDoc(
    doc(db, COLLECTION, DOC_ID),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
