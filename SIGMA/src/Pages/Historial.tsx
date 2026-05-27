import { useContext, useEffect, useState } from "react";
import AuthContext from "../Context/AuthContext";
import { useHistorial } from "../Hooks/useHistorial";
import type { Materia } from "../Hooks/useHistorial";
import { enqueueSnackbar } from "notistack";
import StudentNavbar from "../Components/StudentNavbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/config";
import "./SCSS/Historial.scss";

type Step = 'facultad' | 'carrera' | 'pensum' | 'confirmar';
interface Opcion { id: string; name: string; }

export default function Historial() {
    const context = useContext(AuthContext);
    if (!context) return null;
    const { user, updateUser } = context;

    const {
        facultades, carreras, pensums, materias,
        loading,
        obtenerFacultades, obtenerCarreras, obtenerPensums,
        asignarPensum, obtenerPensumActual, obtenerMaterias,
        añadirMateria, eliminarMateria,
    } = useHistorial();

    // Wizard state
    const [step, setStep] = useState<Step>('facultad');
    const [facultadSel, setFacultadSel] = useState<Opcion | null>(null);
    const [carreraSel, setCarreraSel] = useState<Opcion | null>(null);
    const [pensumSel, setPensumSel] = useState<Opcion | null>(null);

    // Historial state
    const [nombrePensum, setNombrePensum] = useState("");
    const [historial, setHistorial] = useState<string[]>(user?.history ?? []);
    const [procesando, setProcesando] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<'todas' | 'vistas' | 'pendientes'>('todas');
    const [busqueda, setBusqueda] = useState("");

    // ── Carga inicial mejorada (carga desde Firestore si contexto está vacío) ──
    useEffect(() => {
        if (user?.pensum) {
            obtenerPensumActual(user.pensum).then(setNombrePensum);
            obtenerMaterias(user.pensum);

            const cargarHistorialFirestore = async () => {
                // Si el contexto ya tiene historial, úsalo
                if (user.history && user.history.length > 0) {
                    setHistorial(user.history);
                } else {
                    // Sino, trae de Firestore y actualiza contexto
                    const userRef = doc(db, "users", user.id);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const history = userSnap.data().history ?? [];
                        setHistorial(history);
                        updateUser({ history });
                    }
                }
            };
            cargarHistorialFirestore();
        } else {
            obtenerFacultades();
        }
    }, [user?.pensum]);

    // ── Wizard handlers ──
    const handleFacultad = async (op: Opcion) => {
        setFacultadSel(op); setCarreraSel(null); setPensumSel(null);
        await obtenerCarreras(op.id);
        setStep('carrera');
    };

    const handleCarrera = async (op: Opcion) => {
        setCarreraSel(op); setPensumSel(null);
        await obtenerPensums(op.id);
        setStep('pensum');
    };

    const handlePensum = (op: Opcion) => { setPensumSel(op); setStep('confirmar'); };

    const handleBack = () => {
        if (step === 'carrera') { setStep('facultad'); setCarreraSel(null); }
        else if (step === 'pensum') { setStep('carrera'); setPensumSel(null); }
        else if (step === 'confirmar') { setStep('pensum'); setPensumSel(null); }
    };

    const handleAsignarPensum = async () => {
        if (!user || !pensumSel) return;
        try {
            await asignarPensum(pensumSel.id, user.id);
            enqueueSnackbar("Pénsum asignado correctamente", { variant: "success" });
            // Actualiza el contexto con el nuevo pénsum
            updateUser({ pensum: pensumSel.id });
            // También puede tener historial previo que deba cargarse
            const userRef = doc(db, "users", user.id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const history = userSnap.data().history ?? [];
                if (history.length > 0) {
                    updateUser({ history });
                    setHistorial(history);
                }
            }
        } catch {
            enqueueSnackbar("Error al asignar el pénsum", { variant: "error" });
        }
    };

    // ── ÚNICA declaración de handleToggleMateria (actualiza contexto) ──
    const handleToggleMateria = async (materia: Materia) => {
        if (!user) return;
        const vista = historial.includes(materia.id);
        setProcesando(materia.id);
        try {
            if (vista) {
                await eliminarMateria(materia.id, user.id);
                const nuevoHistorial = historial.filter(id => id !== materia.id);
                setHistorial(nuevoHistorial);
                updateUser({ history: nuevoHistorial });
                enqueueSnackbar(`"${materia.name}" eliminada del historial`, { variant: "info" });
            } else {
                await añadirMateria(materia.id, user.id);
                const nuevoHistorial = [...historial, materia.id];
                setHistorial(nuevoHistorial);
                updateUser({ history: nuevoHistorial });
                enqueueSnackbar(`"${materia.name}" añadida al historial`, { variant: "success" });
            }
        } catch {
            enqueueSnackbar("Error al actualizar el historial", { variant: "error" });
        } finally {
            setProcesando(null);
        }
    };

    // ── Filtrado y progreso ──
    const materiasFiltradas = materias
        .filter(m => {
            if (filtro === 'vistas') return historial.includes(m.id);
            if (filtro === 'pendientes') return !historial.includes(m.id);
            return true;
        })
        .filter(m => m.name.toLowerCase().includes(busqueda.toLowerCase()));

    const pct = materias.length
        ? Math.round((historial.filter(id => materias.some(m => m.id === id)).length / materias.length) * 100)
        : 0;

    const stepIndex: Record<Step, number> = { facultad: 0, carrera: 1, pensum: 2, confirmar: 2 };
    const steps = ['Facultad', 'Carrera', 'Pénsum'];

    // ════════════════════════════════════════════════════════
    // VISTA A: PÉNSUM YA ASIGNADO
    // ════════════════════════════════════════════════════════
    if (user?.pensum) {
        const vistas = historial.filter(id => materias.some(m => m.id === id)).length;
        const pendientes = materias.length - vistas;

        return (
            <div className="hist-page">
                <StudentNavbar />
                <div className="hist-container">
                    {/* Header, progreso, filtros y lista de materias (igual que en tu código) */}
                    <div className="hist-header">
                        <span className="hist-header__tag">Historial Académico</span>
                        <h1 className="hist-header__title">Mis Materias</h1>
                        <p className="hist-header__desc">
                            Marca las materias que ya cursaste. Tu progreso se guarda
                            automáticamente en tiempo real.
                        </p>
                    </div>

                    <div className="hist-progress-card">
                        <div className="hist-progress-card__left">
                            <span className="hist-progress-card__label">Pénsum activo</span>
                            <span className="hist-progress-card__pensum">
                                {loading && !nombrePensum ? "Cargando…" : nombrePensum}
                            </span>
                        </div>
                        <div className="hist-progress-card__stats">
                            <div className="hist-stat hist-stat--green"><span>{vistas}</span><small>Vistas</small></div>
                            <div className="hist-stat hist-stat--gray"><span>{pendientes}</span><small>Pendientes</small></div>
                            <div className="hist-stat hist-stat--purple"><span>{pct}%</span><small>Progreso</small></div>
                        </div>
                        <div className="hist-progress-bar">
                            <div className="hist-progress-bar__fill" style={{ width: `${pct}%` }} />
                        </div>
                    </div>

                    <div className="hist-controls">
                        <input
                            className="hist-search"
                            type="text"
                            placeholder="Buscar materia…"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                        <div className="hist-filter-tabs">
                            {(['todas', 'vistas', 'pendientes'] as const).map(f => (
                                <button
                                    key={f}
                                    className={`hist-filter-tab ${filtro === f ? 'hist-filter-tab--active' : ''}`}
                                    onClick={() => setFiltro(f)}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="hist-loader"><div className="hist-loader__spinner" /><span>Cargando materias…</span></div>
                    ) : (
                        <div className="hist-materias">
                            {materiasFiltradas.length === 0 ? (
                                <div className="hist-empty"><span className="hist-empty__icon">📋</span><p>No hay materias que coincidan con el filtro.</p></div>
                            ) : (
                                materiasFiltradas.map(m => {
                                    const vista = historial.includes(m.id);
                                    const enProceso = procesando === m.id;
                                    return (
                                        <div key={m.id} className={`hist-materia-card ${vista ? 'hist-materia-card--vista' : ''}`}>
                                            <div className="hist-materia-card__info">
                                                <span className="hist-materia-card__name">{m.name}</span>
                                                <div className="hist-materia-card__meta">
                                                    <span className="hist-materia-card__credits">{m.credits} crédito{m.credits !== 1 ? 's' : ''}</span>
                                                    {m.semestre > 0 && <span className="hist-materia-card__credits"> · Semestre {m.semestre}</span>}
                                                    {vista && <span className="hist-materia-card__badge">✓ Cursada</span>}
                                                </div>
                                            </div>
                                            <button
                                                className={`hist-materia-card__btn ${vista ? 'hist-materia-card__btn--quitar' : 'hist-materia-card__btn--añadir'}`}
                                                onClick={() => handleToggleMateria(m)}
                                                disabled={enProceso}
                                            >
                                                {enProceso ? '…' : vista ? 'Quitar' : '+ Añadir'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // VISTA B: SIN PÉNSUM (wizard)
    // ════════════════════════════════════════════════════════
    return (
        <div className="hist-page">
            <StudentNavbar />
            <div className="hist-container">
                <div className="hist-header">
                    <span className="hist-header__tag">Configuración inicial</span>
                    <h1 className="hist-header__title">Asignar Pénsum</h1>
                    <p className="hist-header__desc">
                        Selecciona tu facultad, carrera y pénsum académico.
                        Esta configuración es <strong>permanente</strong> y no podrá modificarse posteriormente.
                    </p>
                </div>

                <div className="hist-stepper">
                    {steps.map((label, i) => (
                        <div key={label} className={['hist-step', i < stepIndex[step] ? 'hist-step--done' : '', i === stepIndex[step] ? 'hist-step--active' : ''].join(' ')}>
                            <div className="hist-step__circle">{i < stepIndex[step] ? '✓' : i + 1}</div>
                            <span className="hist-step__label">{label}</span>
                            {i < steps.length - 1 && <div className="hist-step__line" />}
                        </div>
                    ))}
                </div>

                {(facultadSel || carreraSel) && (
                    <div className="hist-breadcrumb">
                        {facultadSel && <span className="hist-breadcrumb__item">🏛 {facultadSel.name}</span>}
                        {carreraSel && <><span className="hist-breadcrumb__sep">→</span><span className="hist-breadcrumb__item">📚 {carreraSel.name}</span></>}
                        {pensumSel && <><span className="hist-breadcrumb__sep">→</span><span className="hist-breadcrumb__item hist-breadcrumb__item--pensum">🗂 {pensumSel.name}</span></>}
                    </div>
                )}

                <div className="hist-panel">
                    {loading && <div className="hist-loader"><div className="hist-loader__spinner" /><span>Cargando opciones…</span></div>}

                    {!loading && step === 'facultad' && (
                        <div className="hist-options">
                            <h2 className="hist-options__title">Selecciona tu Facultad</h2>
                            <div className="hist-grid">
                                {facultades.map(f => (
                                    <button className="hist-option-card" key={f.id} onClick={() => handleFacultad(f)}>
                                        <span className="hist-option-card__icon">🏛</span>
                                        <span className="hist-option-card__label">{f.name}</span>
                                        <span className="hist-option-card__arrow">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && step === 'carrera' && (
                        <div className="hist-options">
                            <h2 className="hist-options__title">Selecciona tu Carrera</h2>
                            <div className="hist-grid">
                                {carreras.map(c => (
                                    <button className="hist-option-card" key={c.id} onClick={() => handleCarrera(c)}>
                                        <span className="hist-option-card__icon">📚</span>
                                        <span className="hist-option-card__label">{c.name}</span>
                                        <span className="hist-option-card__arrow">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && step === 'pensum' && (
                        <div className="hist-options">
                            <h2 className="hist-options__title">Selecciona tu Pénsum</h2>
                            <div className="hist-grid">
                                {pensums.map(p => (
                                    <button className="hist-option-card" key={p.id} onClick={() => handlePensum(p)}>
                                        <span className="hist-option-card__icon">🗂</span>
                                        <span className="hist-option-card__label">{p.name}</span>
                                        <span className="hist-option-card__arrow">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'confirmar' && (
                        <div className="hist-confirm">
                            <div className="hist-confirm__warning">
                                <span className="hist-confirm__warning-icon">⚠️</span>
                                <div>
                                    <strong>Acción irreversible</strong>
                                    <p>Esta opción es <strong>única</strong> y no podrá modificarse posteriormente.</p>
                                </div>
                            </div>
                            <div className="hist-confirm__summary">
                                <div className="hist-confirm__row"><span>Facultad</span><strong>{facultadSel?.name}</strong></div>
                                <div className="hist-confirm__row"><span>Carrera</span><strong>{carreraSel?.name}</strong></div>
                                <div className="hist-confirm__row"><span>Pénsum</span><strong>{pensumSel?.name}</strong></div>
                            </div>
                            <button className="hist-confirm__btn" onClick={handleAsignarPensum}>Confirmar Pénsum</button>
                        </div>
                    )}
                </div>

                {step !== 'facultad' && <button className="hist-back" onClick={handleBack}>← Volver</button>}
            </div>
        </div>
    );
}