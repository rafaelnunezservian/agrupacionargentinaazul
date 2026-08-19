import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'blogPosts';

/**
 * Genera un slug kebab-case sin diacríticos a partir de un título (FR-014,
 * research.md §6). Es solo el valor por defecto que se muestra en el
 * formulario — el admin puede sobreescribirlo antes de crear.
 */
export function generateSlug(title) {
  return (title ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita diacr\u00edticos (tildes, di\u00e9resis)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Chequea si un slug está libre antes de crear (research.md §6). La unicidad
 * real la garantiza Firestore (el slug es el ID del documento) — esto es
 * solo para dar feedback de UX antes de intentar guardar.
 */
export async function isSlugAvailable(slug) {
  const snapshot = await getDoc(doc(db, COLLECTION, slug));
  return !snapshot.exists();
}

/** Listado admin: todas las entradas (incluye borradores), por `updatedAt` desc. */
export async function listBlogPostsAdmin() {
  const postsQuery = query(collection(db, COLLECTION), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(postsQuery);
  return snapshot.docs.map((docSnap) => ({ slug: docSnap.id, ...docSnap.data() }));
}

/** Listado público: solo entradas publicadas, por `publishedAt` desc (FR-020a). */
export async function listPublishedBlogPosts() {
  const postsQuery = query(
    collection(db, COLLECTION),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc')
  );
  const snapshot = await getDocs(postsQuery);
  return snapshot.docs.map((docSnap) => ({ slug: docSnap.id, ...docSnap.data() }));
}

/**
 * Trae una entrada por slug para el sitio público. Un borrador o un slug
 * inexistente resuelven como "no encontrado": la regla deniega el acceso
 * real (permission-denied) a un no-admin, y ambos casos se tratan igual acá
 * (contracts/firestore-contract.md → "Manejo de errores").
 */
export async function getPublishedBlogPost(slug) {
  const snapshot = await getDoc(doc(db, COLLECTION, slug));
  if (!snapshot.exists() || snapshot.data().status !== 'published') {
    return null;
  }
  return { slug: snapshot.id, ...snapshot.data() };
}

/** Trae una entrada por slug para el panel (admin ve borradores también). */
export async function getBlogPostAdmin(slug) {
  const snapshot = await getDoc(doc(db, COLLECTION, slug));
  if (!snapshot.exists()) return null;
  return { slug: snapshot.id, ...snapshot.data() };
}

/**
 * Crea una entrada nueva, siempre en `draft` (research.md §6, contracts).
 * El slug es el ID del documento — `setDoc` en vez de `addDoc`.
 */
export async function createBlogPost(slug, { title, body, coverImageUrl, authorName, authorPhotoUrl }) {
  await setDoc(doc(db, COLLECTION, slug), {
    title,
    body,
    coverImageUrl: coverImageUrl ?? null,
    // Autor de la entrada: alimenta el tercer bloque del sidebar del detalle.
    // Ambos campos son opcionales — sin nombre, el bloque no se muestra.
    authorName: authorName ?? null,
    authorPhotoUrl: authorPhotoUrl ?? null,
    status: 'draft',
    publishedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Actualiza los campos editables de una entrada (no cambia `status`). */
export async function updateBlogPost(slug, { title, body, coverImageUrl, authorName, authorPhotoUrl }) {
  await updateDoc(doc(db, COLLECTION, slug), {
    title,
    body,
    coverImageUrl: coverImageUrl ?? null,
    authorName: authorName ?? null,
    authorPhotoUrl: authorPhotoUrl ?? null,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Publica una entrada (FR-013). La regla rechaza la escritura si no hay
 * `coverImageUrl`. `publishedAt` se setea solo la primera vez que se
 * publica (data-model.md → BlogPost.publishedAt); despublicar/republicar
 * no lo vuelve a tocar.
 */
export async function publishBlogPost(slug, alreadyPublishedBefore) {
  await updateDoc(doc(db, COLLECTION, slug), {
    status: 'published',
    updatedAt: serverTimestamp(),
    ...(alreadyPublishedBefore ? {} : { publishedAt: serverTimestamp() }),
  });
}

/** Despublica una entrada: vuelve a borrador, no borra `publishedAt` (FR-013, FR-015). */
export async function unpublishBlogPost(slug) {
  await updateDoc(doc(db, COLLECTION, slug), {
    status: 'draft',
    updatedAt: serverTimestamp(),
  });
}

/** Elimina una entrada. El borrado de su portada en Storage lo maneja el caller (research.md §5). */
export async function deleteBlogPost(slug) {
  await deleteDoc(doc(db, COLLECTION, slug));
}
