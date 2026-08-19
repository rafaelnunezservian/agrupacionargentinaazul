import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (FR-005a)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validación de tamaño/formato en el cliente, para dar feedback inmediato
 * antes de intentar subir. La autoridad real es storage.rules (research.md §3).
 */
export function validateImageFile(file) {
  if (!file) {
    return 'Seleccioná un archivo de imagen.';
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato no permitido. Usá JPG, PNG o WebP.';
  }
  if (file.size >= MAX_SIZE_BYTES) {
    return 'La imagen supera el tamaño máximo de 5 MB.';
  }
  return null;
}

function extensionFor(file) {
  switch (file.type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

/**
 * Sube una imagen a `images/<folder>/<nombre único>` y devuelve su URL pública.
 * Storage Security Rules validan de nuevo tamaño/formato del lado del servidor.
 */
export async function uploadImage(file, folder) {
  const error = validateImageFile(file);
  if (error) {
    throw new Error(error);
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensionFor(file)}`;
  const storageRef = ref(storage, `images/${folder}/${fileName}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/**
 * Borra una imagen de Cloud Storage a partir de su URL pública de descarga.
 * Silencioso ante "no existe" (ya borrada / URL inválida): no debe romper el
 * flujo de reemplazo o borrado en cascada que la llama (research.md §5).
 */
export async function deleteImageByUrl(url) {
  if (!url) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    if (error?.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}
