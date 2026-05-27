import Navbar from '../Components/Navbar';
import './SCSS/About.scss';

const team = [
    {
        name: "Lucas Garcia Gallego",
        career: "Ingeniería Informática",
        code: "1108253312",
        photo: "/Lucas.jpeg",
    },
    {
        name: "Laura Isabel Campo Ruiz",
        career: "Ingeniería Informática",
        code: "1108334764",
        photo: "/Laura.jpeg",
    },
    {
        name: "Alex Yohan Silva Mina",
        career: "Ingeniería Informática",
        code: "1105927503",
        photo: "/Alex.jpeg",
    },
];

export default function About() {
    return (
        <div className="about-page">
            <Navbar />

            <div className="about-container">

                {/* ── Hero banner ── */}
                <div className="about-hero">
                    <div className="about-hero__blob" />
                    <div className="about-hero__content">
                        <span className="about-hero__tag">¿Qué es SIGMA?</span>
                        <h1 className="about-hero__title">
                            Sistema Institucional de<br />Gestión Matrículas Académicas
                        </h1>
                        <p className="about-hero__desc">
                            Una plataforma moderna para administrar procesos académicos
                            con estructuras de datos reales aplicadas en producción.
                        </p>
                    </div>
                </div>

                {/* ── Secciones de contenido ── */}
                <div className="about-body">

                    <section className="about-section">
                        <h2 className="about-section__title">Sobre SIGMA</h2>
                        <p>
                            SIGMA (Sistema Institucional de Gestión de Matrículas Académicas)
                            es una aplicación web desarrollada para facilitar y optimizar la
                            administración de procesos académicos dentro de una institución
                            educativa. La plataforma permite gestionar matrículas,
                            estructuras académicas, noticias institucionales y control de
                            usuarios mediante una interfaz moderna, dinámica y conectada en
                            tiempo real.
                        </p>
                        <p>
                            El proyecto fue diseñado aplicando conceptos de Estructuras de
                            Datos II dentro de un entorno práctico y funcional,
                            implementando estructuras como pilas, árboles y grafos para
                            resolver problemáticas reales relacionadas con la gestión
                            académica universitaria.
                        </p>
                    </section>

                    <section className="about-section">
                        <h2 className="about-section__title">Gestión de Usuarios</h2>
                        <p>
                            SIGMA cuenta con un sistema de autenticación basado en Firebase
                            Authentication, utilizando inicio de sesión mediante correo
                            electrónico y contraseña.
                        </p>
                        <p>
                            La autenticación se encuentra integrada con Firestore,
                            permitiendo almacenar y administrar información personalizada de
                            cada usuario dentro de la base de datos.
                        </p>

                        <h3 className="about-section__subtitle">Estudiantes</h3>
                        <p>Los estudiantes tienen acceso al sistema de matrículas y a la
                            información académica relacionada con su pensum.</p>
                        <ul className="about-list">
                            <li>Historial académico representado mediante una lista de IDs de materias cursadas.</li>
                            <li>Pensum académico al que pertenece el estudiante.</li>
                            <li>Variable <strong>enroll</strong>, utilizada para determinar si el estudiante ya realizó su matrícula.</li>
                        </ul>

                        <h3 className="about-section__subtitle">Administradores</h3>
                        <p>Los administradores poseen acceso exclusivo a las páginas de gestión del sistema.</p>
                        <ul className="about-list">
                            <li>Noticias institucionales.</li>
                            <li>Facultades.</li>
                            <li>Carreras.</li>
                            <li>Pensums.</li>
                            <li>Materias.</li>
                            <li>Cupos académicos.</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2 className="about-section__title">Sistema de Noticias</h2>
                        <p>
                            El módulo de noticias académicas fue desarrollado utilizando una
                            estructura de datos basada en <strong>pilas</strong>.
                        </p>
                        <p>
                            Las noticias pueden visualizarse desde la página principal sin
                            necesidad de iniciar sesión. Para administrar el contenido es
                            necesario iniciar sesión como administrador.
                        </p>
                        <ul className="about-list">
                            <li>Crear noticias.</li>
                            <li>Editar publicaciones existentes.</li>
                            <li>Eliminar noticias.</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2 className="about-section__title">Sistema de Matrículas</h2>

                        <h3 className="about-section__subtitle">Estructura de Árboles</h3>
                        <p>La organización académica se representa mediante árboles jerárquicos:</p>
                        <div className="about-badge-row">
                            <span className="about-badge">Facultad</span>
                            <span className="about-badge-arrow">→</span>
                            <span className="about-badge">Carrera</span>
                            <span className="about-badge-arrow">→</span>
                            <span className="about-badge">Pensum</span>
                        </div>

                        <h3 className="about-section__subtitle">Estructura de Grafos</h3>
                        <p>
                            Cada pensum implementa una estructura de grafos para representar
                            prerrequisitos académicos entre materias, conectando asignaturas
                            según sus dependencias dentro del sistema universitario.
                        </p>

                        <h3 className="about-section__subtitle">Gestión de Materias</h3>
                        <ul className="about-list">
                            <li>Nombre de la materia.</li>
                            <li>Número de créditos.</li>
                            <li>ID de la materia.</li>
                            <li>Lista de grupos disponibles (nombre del grupo y cupos).</li>
                        </ul>

                        <h3 className="about-section__subtitle">Sistema de Matriculados</h3>
                        <p>
                            Cuando un estudiante realiza una matrícula, los cupos se
                            actualizan automáticamente en tiempo real, reflejando
                            inmediatamente la disponibilidad dentro de la plataforma.
                        </p>
                        <ul className="about-list">
                            <li>ID de la materia.</li>
                            <li>Cupos disponibles.</li>
                            <li>Lista de estudiantes matriculados.</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2 className="about-section__title">Tecnologías Utilizadas</h2>
                        <div className="about-tech-grid">
                            {[
                                { name: "Firebase", desc: "Autenticación, Firestore y gestión de sesiones." },
                                { name: "React", desc: "Interfaz de usuario modular, dinámica y eficiente." },
                                { name: "Node.js", desc: "Entorno de ejecución y manejo de dependencias." },
                                { name: "SCSS", desc: "Estilos personalizados y diseño organizado." },
                                { name: "Notistack", desc: "Notificaciones dinámicas en toda la plataforma." },
                            ].map((tech) => (
                                <div className="about-tech-card" key={tech.name}>
                                    <span className="about-tech-card__name">{tech.name}</span>
                                    <p className="about-tech-card__desc">{tech.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="about-section">
                        <h2 className="about-section__title">Objetivo del Proyecto</h2>
                        <p>
                            SIGMA busca representar de manera práctica la aplicación de
                            estructuras de datos dentro de un entorno real, integrando
                            conceptos académicos con tecnologías modernas de desarrollo web.
                        </p>
                        <p>
                            La plataforma permite administrar procesos institucionales de
                            manera organizada, dinámica y eficiente, demostrando cómo
                            estructuras como pilas, árboles y grafos pueden utilizarse para
                            resolver problemáticas reales en sistemas académicos.
                        </p>
                    </section>

                    {/* ── Equipo de Desarrollo ── */}
                    <section className="about-section about-section--team">
                        <h2 className="about-section__title">Equipo de Desarrollo</h2>
                        <p className="about-team__intro">
                            Estudiantes de Ingeniería Informática responsables del diseño,
                            desarrollo e implementación de SIGMA.
                        </p>
                        <div className="about-team-grid">
                            {team.map((member) => (
                                <div className="about-team-card" key={member.code}>
                                    <div className="about-team-card__avatar">
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        <div className="about-team-card__initials">
                                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                    </div>
                                    <h3 className="about-team-card__name">{member.name}</h3>
                                    <p className="about-team-card__career">{member.career}</p>           
                                    <span className="about-team-card__code">Cód. {member.code}</span>
                                    
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}