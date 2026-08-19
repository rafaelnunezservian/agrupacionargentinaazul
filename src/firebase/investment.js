import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'investmentSection';
const DOC_ID = 'acuicultura';

/**
 * Trae el documento singleton de la sección de inversión de Acuicultura
 * (FR-016 a FR-018). No tiene estado borrador/publicado — toda edición es
 * efectiva de inmediato (FR-019). Devuelve `null` si todavía no se cargó
 * ningún dato (antes de T052) para que el caller decida cómo degradar.
 */
export async function getInvestmentSection() {
  const snapshot = await getDoc(doc(db, COLLECTION, DOC_ID));
  if (!snapshot.exists()) return null;
  return snapshot.data();
}

/**
 * Crea o actualiza el documento singleton (`setDoc` con `merge: true` cubre
 * ambos casos sin necesitar saber de antemano si ya existe, contracts/
 * firestore-contract.md → "Editar inversión").
 */
export async function saveInvestmentSection(data) {
  await setDoc(
    doc(db, COLLECTION, DOC_ID),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
