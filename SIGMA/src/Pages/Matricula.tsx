import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../Context/AuthContext";
import { useMatricula } from "../Hooks/useMatricula";
import type { Grupo } from "../Utils/Graph";
import StudentNavbar from "../Components/StudentNavbar";
import "./SCSS/Matricula.scss";

export default function Matricula() {
    const context = useContext(AuthContext);
    if (!context) return null;
    const { user, updateUser } = context;
    if (!user) return null;

    const { materias, loading, obtenerMateriasRealtime, matricularGrupo, cargarMatriculaUsuario, cargarHistorialUsuario } = useMatricula();
    const unsubRef = useRef<(() => void) | null>(null);

    const [expandida,      setExpandida]      = useState<string | null>(null);
    const [busqueda,       setBusqueda]       = useState("");
    const [filtro,         setFiltro]         = useState<'todas' | 'disponibles' | 'matriculadas'>('todas');
    const [semestreFiltro, setSemestreFiltro] = useState<number | 'todos'>('todos');

    useEffect(() => {
        if (!user.pensum) return;
        obtenerMateriasRealtime(user.pensum).then(unsub => {
            if (unsub) unsubRef.current = unsub;
        });
        return () => { unsubRef.current?.(); };
    }, [user.pensum]);

    useEffect(() => {
        
        const cargarDatosFaltantes = async () => {
            let cambios = false;
            // Si el usuario tiene pensum pero no tiene matricula o está vacío, cargar
            if (user.pensum && (!user.matricula || user.matricula.length === 0)) {
                const matriculaFire = await cargarMatriculaUsuario(user.id);
                if (matriculaFire.length > 0) {
                    updateUser({ matricula: matriculaFire });
                    cambios = true;
                }
            }
            // Si el usuario tiene pensum pero no tiene history o está vacío, cargar
            if (user.pensum && (!user.history || user.history.length === 0)) {
                const historyFire = await cargarHistorialUsuario(user.id);
                if (historyFire.length > 0) {
                    updateUser({ history: historyFire });
                    cambios = true;
                }
            }
            // Si hubo cambios, forzar re-render (updateUser ya lo hace)
        };
        cargarDatosFaltantes();
    }, [user.pensum, user.id]);

    const matriculaUsuario = user.matricula ?? [];
    const historialUsuario = user.history   ?? [];

    // ── Helpers ───────────────────────────────────────────────
    const yaMatriculadoEn = (materiaId: string): string | null =>
        matriculaUsuario.find(m => m.materiaId === materiaId)?.grupoNombre ?? null;

    /**
     * prerequisitesId en GrafoMaterias contiene IDs de materias que el
     * estudiante DEBE haber cursado (deben estar en user.history).
     * Si el array está vacío → sin restricciones → puede matricular.
     */
    const cumpleRequisitos = (prerequisites: string[]): boolean => {
        if (prerequisites.length === 0) return true;
        return prerequisites.every(id => historialUsuario.includes(id));
    };

    const cuposRestantes = (grupo: Grupo): number =>
        grupo.cupos - (grupo.matriculados?.length ?? 0);

    const semestresDisponibles = [...new Set(materias.map(m => m.semestre))].sort((a, b) => a - b);

    const materiasFiltradas = materias
        .filter(m => {
            if (filtro === 'disponibles')  return !yaMatriculadoEn(m.id) && cumpleRequisitos(m.prerequisites);
            if (filtro === 'matriculadas') return !!yaMatriculadoEn(m.id);
            return true;
        })
        .filter(m => semestreFiltro === 'todos' || m.semestre === semestreFiltro)
        .filter(m => m.nombre?.toLowerCase().includes(busqueda.toLowerCase()));

    const totalMatriculadas = matriculaUsuario.length;
    const totalCreditos = materias
        .filter(m => yaMatriculadoEn(m.id))
        .reduce((acc, m) => acc + (m.creditos ?? 0), 0);

    const handleMatricular = async (materia: typeof materias[0], grupoNombre: string) => {
        await matricularGrupo(materia, grupoNombre, user);
        // Refleja el cambio localmente sin esperar a Firebase Auth refresh
        updateUser({
            matricula: [...matriculaUsuario, { materiaId: materia.id, grupoNombre }],
        });
    };

    // ── Sin pénsum ────────────────────────────────────────────
    if (!user.pensum) {
        return (
            <div className="mat-page">
                <StudentNavbar />
                <div className="mat-container">
                    <div className="mat-empty">
                        <span className="mat-empty__icon">🎓</span>
                        <h2>Sin pénsum asignado</h2>
                        <p>Debes asignar tu pénsum académico antes de poder matricularte.</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Loader hasta que el primer snapshot llegue ────────────
    // Esto evita que las cards se pinten con estado incorrecto
    // mientras los datos aún no han llegado de Firestore.
    const cargandoInicial = loading || (materias.length === 0);

    return (
        <div className="mat-page">
            <StudentNavbar />
            <div className="mat-container">

                {/* Header */}
                <div className="mat-header">
                    <div className="mat-header__left">
                        <span className="mat-header__tag">Sistema de Matrículas</span>
                        <h1 className="mat-header__title">Matrícula Académica</h1>
                        <p className="mat-header__desc">
                            Selecciona tus materias y grupos. Los cupos se actualizan
                            en <strong>tiempo real</strong> — actúa rápido.
                        </p>
                    </div>
                    <div className="mat-header__stats">
                        <div className="mat-stat mat-stat--purple">
                            <span>{totalMatriculadas}</span>
                            <small>Materias</small>
                        </div>
                        <div className="mat-stat mat-stat--green">
                            <span>{totalCreditos}</span>
                            <small>Créditos</small>
                        </div>
                        <div className="mat-realtime-badge">
                            <span className="mat-realtime-badge__dot" />
                            En vivo
                        </div>
                    </div>
                </div>

                {/* Controles — solo visibles cuando hay datos */}
                {!cargandoInicial && (
                    <div className="mat-controls">
                        <input
                            className="mat-search"
                            type="text"
                            placeholder="Buscar materia…"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                        <div className="mat-filter-tabs">
                            {(['todas', 'disponibles', 'matriculadas'] as const).map(f => (
                                <button
                                    key={f}
                                    className={`mat-filter-tab ${filtro === f ? 'mat-filter-tab--active' : ''}`}
                                    onClick={() => setFiltro(f)}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        <select
                            className="mat-semestre-select"
                            value={semestreFiltro}
                            onChange={e => setSemestreFiltro(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                        >
                            <option value="todos">Todos los semestres</option>
                            {semestresDisponibles.map(s => (
                                <option key={s} value={s}>Semestre {s}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Contenido */}
                {cargandoInicial ? (
                    <div className="mat-loader">
                        <div className="mat-loader__spinner" />
                        <span>Cargando materias en tiempo real…</span>
                    </div>
                ) : materiasFiltradas.length === 0 ? (
                    <div className="mat-empty">
                        <span className="mat-empty__icon">📋</span>
                        <p>No hay materias que coincidan con el filtro.</p>
                    </div>
                ) : (
                    <div className="mat-list">
                        {materiasFiltradas.map(materia => {
                            const grupoActual = yaMatriculadoEn(materia.id);
                            const tieneReqs   = cumpleRequisitos(materia.prerequisites);
                            const abierta     = expandida === materia.id;

                            return (
                                <div
                                    key={materia.id}
                                    className={[
                                        'mat-card',
                                        grupoActual ? 'mat-card--matriculada' : '',
                                        !tieneReqs  ? 'mat-card--bloqueada'   : '',
                                    ].join(' ')}
                                >
                                    <div
                                        className="mat-card__header"
                                        onClick={() => setExpandida(abierta ? null : materia.id)}
                                    >
                                        <div className="mat-card__info">
                                            <div className="mat-card__top">
                                                <span className="mat-card__nombre">{materia.nombre}</span>
                                                {grupoActual && (
                                                    <span className="mat-badge mat-badge--green">✓ {grupoActual}</span>
                                                )}
                                                {!tieneReqs && !grupoActual && (
                                                    <span className="mat-badge mat-badge--red">🔒 Requisitos</span>
                                                )}
                                            </div>
                                            <div className="mat-card__meta">
                                                <span>Cód. {materia.codigo}</span>
                                                <span>·</span>
                                                <span>{materia.creditos} créditos</span>
                                                <span>·</span>
                                                <span>Semestre {materia.semestre}</span>
                                                <span>·</span>
                                                <span>{materia.grupos?.length ?? 0} grupo{(materia.grupos?.length ?? 0) !== 1 ? 's' : ''}</span>
                                            </div>
                                            {materia.prerequisites.length > 0 && (
                                                <div className="mat-card__reqs">
                                                    <span className="mat-card__reqs-label">Requisitos:</span>
                                                    {materia.prerequisites.map(id => {
                                                        const aprobada  = historialUsuario.includes(id);
                                                        const nombreReq = materias.find(m => m.id === id)?.nombre ?? id;
                                                        return (
                                                            <span
                                                                key={id}
                                                                className={`mat-req-chip ${aprobada ? 'mat-req-chip--ok' : 'mat-req-chip--fail'}`}
                                                            >
                                                                {aprobada ? '✓' : '✗'} {nombreReq}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`mat-card__chevron ${abierta ? 'mat-card__chevron--open' : ''}`}>›</span>
                                    </div>

                                    {abierta && (
                                        <div className="mat-grupos">
                                            {(materia.grupos ?? []).map(grupo => {
                                                const restantes = cuposRestantes(grupo);
                                                const lleno     = restantes <= 0;
                                                const esteGrupo = grupoActual === grupo.nombre;
                                                const ocupacion = Math.min(
                                                    100,
                                                    Math.round(((grupo.matriculados?.length ?? 0) / grupo.cupos) * 100)
                                                );

                                                return (
                                                    <div
                                                        key={grupo.nombre}
                                                        className={[
                                                            'mat-grupo',
                                                            lleno     ? 'mat-grupo--lleno'      : '',
                                                            esteGrupo ? 'mat-grupo--matriculado' : '',
                                                        ].join(' ')}
                                                    >
                                                        <div className="mat-grupo__info">
                                                            <span className="mat-grupo__nombre">{grupo.nombre}</span>
                                                            <div className="mat-grupo__cupos">
                                                                <span className={`mat-grupo__num ${lleno ? 'mat-grupo__num--lleno' : ''}`}>
                                                                    {restantes} / {grupo.cupos} cupos
                                                                </span>
                                                                {lleno     && <span className="mat-badge mat-badge--red">Agotado</span>}
                                                                {esteGrupo && <span className="mat-badge mat-badge--green">✓ Inscrito</span>}
                                                            </div>
                                                            <div className="mat-grupo__bar">
                                                                <div
                                                                    className={`mat-grupo__bar-fill ${ocupacion >= 100 ? 'mat-grupo__bar-fill--full' : ocupacion >= 70 ? 'mat-grupo__bar-fill--warn' : ''}`}
                                                                    style={{ width: `${ocupacion}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <button
                                                            className={[
                                                                'mat-grupo__btn',
                                                                esteGrupo           ? 'mat-grupo__btn--inscrito'  : '',
                                                                lleno && !esteGrupo ? 'mat-grupo__btn--lleno'     : '',
                                                                !tieneReqs          ? 'mat-grupo__btn--bloqueado' : '',
                                                            ].join(' ')}
                                                            disabled={lleno || !!grupoActual || !tieneReqs}
                                                            onClick={() => handleMatricular(materia, grupo.nombre)}
                                                        >
                                                            {esteGrupo   ? '✓ Inscrito'  :
                                                             lleno       ? 'Sin cupos'   :
                                                             !tieneReqs  ? 'Bloqueado'   :
                                                             grupoActual ? 'Ya inscrito' :
                                                             'Matricular'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}