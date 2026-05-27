import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from "../Context/AuthContext";
import './SCSS/AdminNavbar.scss';

export default function StudentNavbar() {

    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useContext(AuthContext);

    useEffect(() => {

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);

    }, []);

    const handleLogout = () => {
        auth?.logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className={`admin-navbar ${scrolled ? 'admin-navbar--scrolled' : ''}`}>
            <div className="admin-navbar__container">
                {/* Logo */}
                <a href="/" className="admin-navbar__logo">
                    <div className="admin-navbar__logo-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" stroke="#7C3AED" strokeWidth="2.5" fill="none" />
                        <path
                            d="M9 16.5L13.5 21L23 11"
                            stroke="#7C3AED"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    </div>
                        <span className="admin-navbar__logo-text">SIGMA</span>
                        <span className="admin-navbar__logo-badge">Estudiante</span>
                </a>
                {/* Nav Links */}
                <ul className={`admin-navbar__links ${menuOpen ? 'admin-navbar__links--open' : ''}`}>
                    <li>
                        <button
                            className={`admin-navbar__link ${isActive('/Dashboard') ? 'admin-navbar__link--active' : ''}`}
                            onClick={() => { navigate('/DashboardStudent'); setMenuOpen(false); }}
                        >
                            Inicio
                        </button>
                    </li>
                    <li>
                        <button
                            className={`admin-navbar__link ${isActive('/Dashboard/Matriculas') ? 'admin-navbar__link--active' : ''}`}
                            onClick={() => { navigate('/Dashboard/Matriculas'); setMenuOpen(false); }}
                        >
                            Matriculas
                        </button>
                    </li>
                    <li>
                        <button
                            className={`admin-navbar__link ${isActive('/Dashboard/Historial') ? 'admin-navbar__link--active' : ''}`}
                            onClick={() => { navigate('/Dashboard/Historial'); setMenuOpen(false); }}
                        >
                            Historial
                        </button>
                    </li>
                    <li>
                        <button className="admin-navbar__cta" onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </li>
                </ul>
                {/* Mobile hamburger */}
                <button
                    className={`admin-navbar__hamburger ${menuOpen ? 'admin-navbar__hamburger--open' : ''}`}
                    aria-label="Toggle menu"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        </nav>
    );
}