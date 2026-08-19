import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'linkTreeLinks';

/**
 * Id de documento fijo del único acceso de type 'website' — es el mecanismo
 * que lo distingue del resto (no eliminable, no cambia de tipo), no un campo
 * de datos (specs/002-linktree-qr/research.md §1).
 */
export const WEBSITE_LINK_ID = 'website';

const DEFAULT_WEBSITE_LINK = {
  type: 'website',
  label: 'Sitio web',
  value: 'https://agrupacionargentinaazul.com',
  // order fijo en 0: nunca participa del reordenamiento (reorderLinks lo
  // excluye siempre) y al ser el más chico entre los accesos activos,
  // queda primero en listActiveLinks() sin necesidad de un caso especial
  // en la query ni en el render (FR-023, research.md §1-2).
  order: 0,
  active: true,
};

/**
 * Trae todos los accesos (uso del panel de administración, incluye ocultos),
 * ordenados por `order`. Incluye el acceso "Página web" (order 0, siempre
 * primero).
 */
export async function listLinks() {
  const linksQuery = query(collection(db, COLLECTION), orderBy('order'));
  const snapshot = await getDocs(linksQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

/**
 * Trae solo los accesos activos (consumida por la página pública `/links`),
 * ordenados por `order` (FR-032).
 */
export async function listActiveLinks() {
  const linksQuery = query(
    collection(db, COLLECTION),
    where('active', '==', true),
    orderBy('order')
  );
  const snapshot = await getDocs(linksQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

/**
 * Crea el documento `linkTreeLinks/website` con valores por defecto si
 * todavía no existe (FR-023, SC-008) — se llama al abrir el editor de admin,
 * para que ese acceso nunca falte incluso en una instalación nueva. No pisa
 * el documento si ya existe.
 */
export async function ensureWebsiteLink() {
  const ref = doc(db, COLLECTION, WEBSITE_LINK_ID);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;
  await setDoc(ref, {
    ...DEFAULT_WEBSITE_LINK,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Crea un acceso nuevo (nunca de type 'website', que es singleton — ver
 * ensureWebsiteLink). El `order` lo decide el caller (por defecto, al final
 * de la lista actual de accesos no fijos).
 */
export async function createLink(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    active: data.active ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Actualiza un acceso existente (incluido 'website': solo label/value en la práctica). */
export async function updateLink(id, data) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Elimina un acceso. El caller debe garantizar que nunca se llame con WEBSITE_LINK_ID
 *  (la Security Rule lo rechaza igual como última autoridad, ver firebase/firestore.rules). */
export async function deleteLink(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Persiste un nuevo orden para los accesos que no son "Página web" (FR-031)
 * en una sola escritura atómica — mismo patrón que `reorderTeamMembers` en
 * `src/firebase/team.js`. El id 'website', si viene incluido en `orderedIds`
 * por error, se ignora: su `order` es fijo.
 */
export async function reorderLinks(orderedIds) {
  const batch = writeBatch(db);
  orderedIds
    .filter((id) => id !== WEBSITE_LINK_ID)
    .forEach((id, index) => {
      batch.update(doc(db, COLLECTION, id), { order: index + 1, updatedAt: serverTimestamp() });
    });
  await batch.commit();
}
