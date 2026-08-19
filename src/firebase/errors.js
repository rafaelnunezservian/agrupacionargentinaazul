// Mapeo de códigos de error del SDK de Firebase a mensajes de UI (panel de admin)
// y a estado degradado del sitio público (FR-021). No hay backend que emita un
// formato de error propio — se interpretan directo los códigos que devuelve el SDK
// (ver contracts/firestore-contract.md → "Manejo de errores").

const AUTH_MESSAGES = {
  'auth/invalid-email': 'El email ingresado no es válido.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en unos minutos.',
  'auth/network-request-failed': 'No hay conexión con el servidor. Revisá tu internet e intentá de nuevo.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
};

const WRITE_MESSAGES = {
  'permission-denied': 'No tenés permiso para hacer esta acción, o faltan datos obligatorios.',
  unavailable: 'No se pudo conectar con el servidor. Intentá de nuevo en unos segundos.',
  'not-found': 'El contenido que intentás editar ya no existe.',
  'resource-exhausted': 'Se alcanzó un límite del servicio. Intentá más tarde.',
  cancelled: 'La operación fue cancelada.',
};

/**
 * Traduce un error de login (Firebase Authentication) a un mensaje de UI.
 */
export function getAuthErrorMessage(error) {
  return AUTH_MESSAGES[error?.code] ?? 'No se pudo iniciar sesión. Intentá de nuevo.';
}

/**
 * Traduce un error de escritura del panel (Firestore/Storage) a un mensaje de UI.
 */
export function getWriteErrorMessage(error) {
  return WRITE_MESSAGES[error?.code] ?? 'No se pudo guardar. Intentá de nuevo.';
}

/**
 * Toda lectura pública fallida (FR-021) degrada a estado vacío/mensaje en vez de
 * romper la página: sin red, servicio no disponible, o documento no accesible
 * (borrador/inexistente resuelve como "permission-denied", tratado como "no encontrado").
 * No hay ningún caso de error de lectura pública que deba propagarse como excepción visible.
 */
export function isDegradedReadError(_error) {
  return true;
}
