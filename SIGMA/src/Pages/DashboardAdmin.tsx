import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../Components/AdminNavbar';
import './SCSS/DashboardAdmin.scss';
import type { JSX } from 'react';

interface AdminCard {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: JSX.Element;
  label: string;
}

const cards: AdminCard[] = [
  {
    id: 'academic',
    title: 'Administración Académica',
    description:
      'Gestiona el árbol académico, estructura de programas, materias y prerrequisitos del sistema de matrículas.',
    route: '/Dashboard/ArbolAcademico',
    label: 'Ir a Administración Académica',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'news',
    title: 'Administración de Noticias',
    description:
      'Crea, edita y publica noticias institucionales visibles para los estudiantes en la página principal.',
    route: '/Dashboard/Noticias',
    label: 'Ir a Administración de Noticias',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function DashboardAdmin() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-admin">
      <AdminNavbar />

      <main className="dashboard-admin__main">
        {/* ── Encabezado de bienvenida ── */}
        <header className="dashboard-admin__header">
          <div className="dashboard-admin__header-badge">Panel Administrativo</div>
          <h1 className="dashboard-admin__title">Panel de Administración</h1>
          <p className="dashboard-admin__subtitle">
            Desde aquí puedes gestionar las áreas principales del sistema SIGMA: la estructura
            académica y las noticias institucionales.
          </p>
        </header>

        {/* ── Tarjetas de módulos ── */}
        <section className="dashboard-admin__cards" aria-label="Módulos de administración">
          {cards.map((card, index) => (
            <article
              key={card.id}
              className="dashboard-admin__card"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="dashboard-admin__card-icon" aria-hidden="true">
                {card.icon}
              </div>
              <div className="dashboard-admin__card-body">
                <h2 className="dashboard-admin__card-title">{card.title}</h2>
                <p className="dashboard-admin__card-desc">{card.description}</p>
              </div>
              <button
                className="dashboard-admin__card-btn"
                onClick={() => navigate(card.route)}
                aria-label={card.label}
              >
                Acceder
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}