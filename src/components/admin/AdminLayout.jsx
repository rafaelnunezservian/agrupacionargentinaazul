import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../../firebase/auth';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/blog-diseno', label: 'Blog · Diseño' },
  { to: '/admin/equipo-home', label: 'Equipo · Home' },
  { to: '/admin/equipo-acuicultura', label: 'Equipo · Acuicultura' },
  { to: '/admin/inversion', label: 'Inversión' },
  { to: '/admin/links', label: 'Enlaces' },
];

/**
 * Shell del panel de administración: navegación entre las cuatro áreas
 * autoadministrables y botón de logout (FR-003). El contenido de cada
 * sección se registra como ruta hija de "/admin/*" en las historias
 * de usuario correspondientes.
 */
const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin', { replace: true });
  };

  return (
    <div className="admin-layout">
      <header className="admin-layout-header">
        <span className="admin-layout-brand">Panel · Argentina Azul</span>
        <button type="button" className="admin-layout-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="admin-layout-body">
        <nav className="admin-layout-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'admin-layout-nav-link admin-layout-nav-link-active' : 'admin-layout-nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="admin-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
