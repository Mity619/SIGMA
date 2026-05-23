import React from 'react';
import Navbar from '../Components/Navbar';
import './SCSS/home.scss';

export default function Home() {
  return (
    <div className="home">
      <Navbar />

      <main className="home__hero">

        {/* ── Columna izquierda: texto ── */}
        <div className="home__hero-content">
          <p className="home__hero-subtitle">
            Sistema Institucional de Gestión Matrículas Académicas
          </p>
          <h1 className="home__hero-title">
            Gestiona tu<br />matrícula ahora
          </h1>
          <p className="home__hero-desc">
            Un paso más para el inicio de tu semestre
          </p>
          <a href="/SignUp" className="home__hero-cta">
            REGÍSTRATE AHORA
          </a>
        </div>

        {/* ── Columna derecha: óvalo púrpura + estudiante ── */}
        <div className="home__hero-visual">
          <div className="home__hero-blob">
            {/*
              Cambia "student.png" por el nombre exacto de tu archivo en /public
              Ejemplos: "/estudiante.png"  "/img/student.jpg"
            */}
            <img
              src="/student.png"
              alt="Estudiante universitario"
              className="home__hero-img"
            />
          </div>
        </div>

      </main>
    </div>
  );
};