import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { login, useAuth } from '../../firebase/auth';
import { getAuthErrorMessage } from '../../firebase/errors';
import './AdminLogin.css';

/**
 * Pantalla de login del panel (FR-001). Único usuario administrador,
 * email/password. Sin flujo de recuperación de contraseña — el reseteo
 * lo hace el proveedor desde la consola de Firebase (Assumptions del spec).
 */
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const redirectTo = location.state?.from ?? '/admin/blog';

  // Ya hay sesión activa (p. ej. se navegó a /admin manualmente estando logueado):
  // no tiene sentido mostrar el formulario de nuevo.
  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Ingresá tu email y tu contraseña.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(getAuthErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1 className="admin-login-title">Panel de administración</h1>
        <p className="admin-login-subtitle">Agrupación Argentina Azul</p>

        <label className="admin-login-label" htmlFor="admin-login-email">Email</label>
        <input
          id="admin-login-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={submitting}
          required
        />

        <label className="admin-login-label" htmlFor="admin-login-password">Contraseña</label>
        <input
          id="admin-login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={submitting}
          required
        />

        {error && <p className="admin-login-error" role="alert">{error}</p>}

        <button type="submit" className="admin-login-submit" disabled={submitting}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
