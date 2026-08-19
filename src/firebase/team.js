import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'teamMembers';

/**
 * Lista los integrantes de una sección ('home' | 'acuicultura'), ordenados
 * por `order` (FR-008: las secciones son independientes entre sí). Usada
 * tanto por el sitio público como por el panel de administración.
 */
export async function listTeamMembers(section) {
  const membersQuery = query(
    collection(db, COLLECTION),
    where('section', '==', section),
    orderBy('order')
  );
  const snapshot = await getDocs(membersQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

/**
 * Crea un integrante nuevo (FR-004, FR-006, FR-007). El caller decide el
 * `order` (por defecto, al final de la sección).
 */
export async function createTeamMember(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Actualiza un integrante existente. */
export async function updateTeamMember(id, data) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Elimina un integrante. El borrado de su foto en Storage lo maneja el caller (research.md §5). */
export async function deleteTeamMember(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Persiste un nuevo orden para una lista de integrantes de una misma sección
 * en una sola escritura atómica (FR-007, T021).
 */
export async function reorderTeamMembers(orderedIds) {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, COLLECTION, id), { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}
