import { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Inicia sesión del único usuario administrador (email/password).
 * Las Security Rules son la autoridad real (research.md §2) — este login
 * solo obtiene la sesión de Firebase Auth que las reglas van a verificar.
 */
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Cierra la sesión activa del administrador. */
export function logout() {
  return signOut(auth);
}

/**
 * Hook de sesión: expone el usuario autenticado (o null) y si todavía
 * se está resolviendo el estado inicial de Auth.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
