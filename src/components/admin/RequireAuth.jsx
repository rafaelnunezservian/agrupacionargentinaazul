import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../firebase/auth';

/**
 * Guard de rutas: redirige a /admin (login) cuando no hay sesión activa (FR-001).
 * Mientras se resuelve el estado inicial de Auth no redirige (evita un
 * parpadeo al login en cada recarga de página).
 */
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/admin" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default RequireAuth;
