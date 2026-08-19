import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Impact from './components/Impact';
import AcuiPromo from './components/AcuiPromo';
import Team from './components/Team';
import BlogPromo from './components/BlogPromo';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import AcuiculturaPage from './components/acuicultura/AcuiculturaPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import RequireAuth from './components/admin/RequireAuth';
import AdminTeamEditor from './components/admin/AdminTeamEditor';
import AdminBlogEditor from './components/admin/AdminBlogEditor';
import AdminBlogDesign from './components/admin/AdminBlogDesign';
import AdminInvestmentEditor from './components/admin/AdminInvestmentEditor';
import AdminLinksEditor from './components/admin/AdminLinksEditor';
import BlogPage from './components/blog/BlogPage';
import BlogPostPage from './components/blog/BlogPostPage';
import LinksPage from './components/links/LinksPage';
import './App.css';

function HomePage() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    const hash = window.location.hash;
    if (hash) {
      window.setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 300);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <About />
      <Impact />
      <AcuiPromo />
      <Team />
      <BlogPromo />
      <CallToAction />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/aquadeal" element={<AcuiculturaPage />} />

      {/* Blog público (FR-020, FR-020a, FR-011, FR-015): listado + detalle. */}
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />

      {/* Linktree público (FR-022), destino del código QR de gráfica. No se
          enlaza desde Navbar/Footer a propósito (specs/002-linktree-qr,
          research.md §5) — se llega solo escaneando el QR o con la URL directa. */}
      <Route path="/links" element={<LinksPage />} />

      {/* Panel de administración (FR-001 a FR-003). "/admin" es siempre el login;
          "/admin/*" es el shell protegido — sus rutas hijas concretas
          (equipo-home, equipo-acuicultura, blog, inversion, links) las registra
          cada historia de usuario correspondiente. */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="equipo-home" element={<AdminTeamEditor section="home" />} />
        <Route path="equipo-acuicultura" element={<AdminTeamEditor section="acuicultura" />} />
        <Route path="blog" element={<AdminBlogEditor />} />
        <Route path="blog-diseno" element={<AdminBlogDesign />} />
        <Route path="inversion" element={<AdminInvestmentEditor />} />
        <Route path="links" element={<AdminLinksEditor />} />
      </Route>
    </Routes>
  );
}

export default App;
