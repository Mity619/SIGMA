import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { closeSnackbar, useSnackbar } from 'notistack';
import { useArchivo } from "../Hooks/useArbolAcademico";
import { useAcademicGraph } from "../Hooks/useGrafoAcademico";
import type { Grupo, GrafoMateria, Materia } from "../Utils/Graph";
import AdminNavbar from "../Components/AdminNavbar";
import "./SCSS/GrafoAcademico.scss";

// Iconos SVG inline
const IconBook = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
);

const IconLayout = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

const IconPlus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const IconEdit = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const IconSave = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);

const IconTrash = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);

const IconX = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconEmpty = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

// Componente principal
export default function GrafoAcademico() {
    const { pensumId } = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const { nodes } = useArchivo();

    const {
        graph,
        materias,
        grafoMaterias,
        getOrCreateGraph,
        getMateriasByCarreraId,
        addMateriaToCarrera,
        editMateriaCarrera,
        deleteMateriaCarrera,
        getGrafoMateriasByGraphId,
        addMateriaToGraph,
        editGrafoMateria,
        deleteGrafoMateria,
        addPrerequisite,
        removePrerequisite,
        getMateriaInfo,
    } = useAcademicGraph();

    // Estados para crear materias generales de la carrera
    const [nombre, setNombre] = useState("");
    const [codigo, setCodigo] = useState("");
    const [creditos, setCreditos] = useState(3);

    const [grupoNombre, setGrupoNombre] = useState("");
    const [grupoCupos, setGrupoCupos] = useState(30);
    const [grupos, setGrupos] = useState<Grupo[]>([]);

    // Estados para asignar materias al pensum
    const [selectedMateriaId, setSelectedMateriaId] = useState("");
    const [selectedSemestre, setSelectedSemestre] = useState(1);

    // Estados para asignar prerrequisitos
    const [selectedGrafoMateriaId, setSelectedGrafoMateriaId] = useState("");
    const [selectedPrerequisiteId, setSelectedPrerequisiteId] = useState("");

    // Estados para editar una materia general de la carrera
    const [editingMateriaId, setEditingMateriaId] = useState<string | null>(null);
    const [editNombre, setEditNombre] = useState("");
    const [editCodigo, setEditCodigo] = useState("");
    const [editCreditos, setEditCreditos] = useState(3);
    const [editGrupos, setEditGrupos] = useState<Grupo[]>([]);

    // Estados para editar la materia asignada al pensum
    const [editingGrafoMateriaId, setEditingGrafoMateriaId] = useState<string | null>(null);
    const [editSemestre, setEditSemestre] = useState(1);

    const pensum = nodes.find((node) => node.id === pensumId);

    // Como el pensum está dentro de una carrera, su parentId es el id de la carrera
    const carreraId = pensum?.parentId || null;
    const carrera = nodes.find((node) => node.id === carreraId);

    // Cargar o crear el grafo del pensum y cargar materias de la carrera
    useEffect(() => {
        const loadData = async () => {
            if (!pensumId || !pensum || !carreraId) return;

            const currentGraph = await getOrCreateGraph(
                pensum.id,
                pensum.name,
                carreraId,
                pensum.childrenId
            );

            await getMateriasByCarreraId(carreraId);
            await getGrafoMateriasByGraphId(currentGraph.id);
        };

        loadData();
    }, [pensumId, pensum]);

    const clearMateriaForm = () => {
        setNombre("");
        setCodigo("");
        setCreditos(3);
        setGrupoNombre("");
        setGrupoCupos(30);
        setGrupos([]);
    };

    const addGrupoToForm = () => {
        if (!grupoNombre.trim() || !grupoCupos) {
            enqueueSnackbar("Completa el nombre del grupo y los cupos disponibles", {
                variant: "warning",
            });
            return;
        }

        if (grupoCupos <= 0) {
            enqueueSnackbar("Los cupos deben ser mayores a cero", {
                variant: "warning",
            });
            return;
        }

        const newGrupo: Grupo = {
            nombre: grupoNombre.trim(),
            cupos: grupoCupos,
            matriculados: []
        };

        setGrupos([...grupos, newGrupo]);
        setGrupoNombre("");
        setGrupoCupos(30);
    };

    const removeGrupoFromForm = (index: number) => {
        setGrupos(grupos.filter((_, i) => i !== index));
    };

    const handleCreateMateria = async () => {
        if (!carreraId) return;

        if (!nombre.trim() || !codigo.trim() || !creditos) {
            enqueueSnackbar("Completa el nombre, código y créditos de la materia", {
                variant: "warning",
            });
            return;
        }

        if (creditos <= 0) {
            enqueueSnackbar("Los créditos deben ser mayores a cero", {
                variant: "warning",
            });
            return;
        }

        try {
            await addMateriaToCarrera(
                carreraId,
                nombre.trim(),
                codigo.trim(),
                creditos,
                grupos
            );

            clearMateriaForm();

            enqueueSnackbar("Materia creada correctamente", {
                variant: "success",
            });
        } catch (error) {
            enqueueSnackbar("Ocurrió un error al crear la materia", {
                variant: "error",
            });
        }
    };

    const startEditingMateria = (materia: Materia) => {
        setEditingMateriaId(materia.id);
        setEditNombre(materia.nombre);
        setEditCodigo(materia.codigo);
        setEditCreditos(materia.creditos);
        setEditGrupos(materia.grupos || []);
    };

    const handleEditMateriaCarrera = async () => {
        if (!carreraId || !editingMateriaId) return;

        if (!editNombre.trim() || !editCodigo.trim() || !editCreditos) {
            enqueueSnackbar("Completa el nombre, código y créditos de la materia", {
                variant: "warning",
            });
            return;
        }

        if (editCreditos <= 0) {
            enqueueSnackbar("Los créditos deben ser mayores a cero", {
                variant: "warning",
            });
            return;
        }

        try {
            await editMateriaCarrera(
                editingMateriaId,
                carreraId,
                editNombre.trim(),
                editCodigo.trim(),
                editCreditos,
                editGrupos
            );

            setEditingMateriaId(null);

            enqueueSnackbar("Materia actualizada correctamente", {
                variant: "success",
            });
        } catch (error) {
            enqueueSnackbar("Ocurrió un error al actualizar la materia", {
                variant: "error",
            });
        }
    };

    const handleDeleteMateriaCarrera = async (materiaId: string) => {
        if (!carreraId) return;

        const materiaAsignadaAlPensum = grafoMaterias.some(
            (gm) => gm.materiaId === materiaId
        );

        if (materiaAsignadaAlPensum) {
            enqueueSnackbar("No se puede eliminar una materia que está asignada al pensum", {
                variant: "warning",
            });
            return;
        }

        const materia = materias.find((item) => item.id === materiaId);

        enqueueSnackbar(
            `¿Seguro que quieres eliminar ${materia?.nombre || "esta materia"} del catálogo de la carrera?`,
            {
                variant: "warning",
                persist: true,
                action: (snackbarId) => (
                    <div className="grafo-academico__snackbar-actions">
                        <button
                            type="button"
                            className="grafo-academico__snackbar-btn grafo-academico__snackbar-btn--danger"
                            onClick={async () => {
                                closeSnackbar(snackbarId);

                                try {
                                    await deleteMateriaCarrera(materiaId, carreraId);

                                    enqueueSnackbar("Materia eliminada del catálogo de la carrera", {
                                        variant: "success",
                                    });
                                } catch (error) {
                                    enqueueSnackbar("Ocurrió un error al eliminar la materia", {
                                        variant: "error",
                                    });
                                }
                            }}
                        >
                            Eliminar
                        </button>

                        <button
                            type="button"
                            className="grafo-academico__snackbar-btn grafo-academico__snackbar-btn--secondary"
                            onClick={() => closeSnackbar(snackbarId)}
                        >
                            Cancelar
                        </button>
                    </div>
                ),
            }
        );
    };

    const addGrupoToEditMateria = () => {
        const nombreGrupo = prompt("Nombre del grupo:");
        if (!nombreGrupo) return;
        const cuposGrupo = Number(prompt("Cupos del grupo:"));
        if (!cuposGrupo) return;
        const newGrupo: Grupo = { nombre: nombreGrupo, cupos: cuposGrupo, matriculados: []};
        setEditGrupos([...editGrupos, newGrupo]);
    };

    const removeGrupoFromEditMateria = (index: number) => {
        setEditGrupos(editGrupos.filter((_, i) => i !== index));
    };

    const handleAddMateriaToGraph = async () => {
        if (!graph) return;

        if (!selectedMateriaId) {
            enqueueSnackbar("Selecciona una materia para asignarla al pensum", {
                variant: "warning",
            });
            return;
        }

        if (!selectedSemestre || selectedSemestre <= 0) {
            enqueueSnackbar("Selecciona el semestre de la materia", {
                variant: "warning",
            });
            return;
        }

        try {
            await addMateriaToGraph(graph.id, selectedMateriaId, selectedSemestre);

            setSelectedMateriaId("");
            setSelectedSemestre(1);

            enqueueSnackbar("Materia asignada al pensum correctamente", {
                variant: "success",
            });
        } catch (error) {
            enqueueSnackbar("Ocurrió un error al asignar la materia al pensum", {
                variant: "error",
            });
        }
    };

    const handleAddPrerequisite = async () => {
        if (!graph) return;

        if (!selectedGrafoMateriaId || !selectedPrerequisiteId) {
            enqueueSnackbar("Selecciona una materia y su prerrequisito", {
                variant: "warning",
            });
            return;
        }

        if (selectedGrafoMateriaId === selectedPrerequisiteId) {
            enqueueSnackbar("Una materia no puede ser prerrequisito de sí misma", {
                variant: "warning",
            });
            return;
        }

        const materiaSeleccionada = grafoMaterias.find(
            (gm) => gm.id === selectedGrafoMateriaId
        );

        const prerequisitoYaAsignado = materiaSeleccionada?.prerequisitesId.includes(
            selectedPrerequisiteId
        );

        if (prerequisitoYaAsignado) {
            enqueueSnackbar("Ese prerrequisito ya está asignado", {
                variant: "info",
            });
            return;
        }

        try {
            await addPrerequisite(
                selectedGrafoMateriaId,
                selectedPrerequisiteId,
                graph.id
            );

            setSelectedGrafoMateriaId("");
            setSelectedPrerequisiteId("");

            enqueueSnackbar("Prerrequisito asignado correctamente", {
                variant: "success",
            });
        } catch (error) {
            enqueueSnackbar("Ocurrió un error al asignar el prerrequisito", {
                variant: "error",
            });
        }
    };

    const handleDeleteGrafoMateria = async (gm: GrafoMateria) => {
        if (!graph) return;

        const materia = getMateriaInfo(gm.materiaId);

        enqueueSnackbar(
            `¿Seguro que quieres quitar ${materia?.nombre || "esta materia"} del pensum?`,
            {
                variant: "warning",
                persist: true,
                action: (snackbarId) => (
                    <div className="grafo-academico__snackbar-actions">
                        <button
                            type="button"
                            className="grafo-academico__snackbar-btn grafo-academico__snackbar-btn--danger"
                            onClick={async () => {
                                closeSnackbar(snackbarId);

                                try {
                                    await deleteGrafoMateria(gm.id, graph.id);

                                    enqueueSnackbar("Materia eliminada del pensum", {
                                        variant: "success",
                                    });
                                } catch (error) {
                                    enqueueSnackbar("Ocurrió un error al eliminar la materia del pensum", {
                                        variant: "error",
                                    });
                                }
                            }}
                        >
                            Quitar
                        </button>

                        <button
                            type="button"
                            className="grafo-academico__snackbar-btn grafo-academico__snackbar-btn--secondary"
                            onClick={() => closeSnackbar(snackbarId)}
                        >
                            Cancelar
                        </button>
                    </div>
                ),
            }
        );
    };

    const startEditingGrafoMateria = (gm: GrafoMateria) => {
        setEditingGrafoMateriaId(gm.id);
        setEditSemestre(gm.semestre);
    };

    const handleEditGrafoMateria = async () => {
        if (!graph || !editingGrafoMateriaId) return;

        if (!editSemestre || editSemestre <= 0) {
            enqueueSnackbar("Selecciona el semestre de la materia", {
                variant: "warning",
            });
            return;
        }

        try {
            await editGrafoMateria(editingGrafoMateriaId, graph.id, editSemestre);

            setEditingGrafoMateriaId(null);

            enqueueSnackbar("Semestre actualizado correctamente", {
                variant: "success",
            });
        } catch (error) {
            enqueueSnackbar("Ocurrió un error al actualizar el semestre", {
                variant: "error",
            });
        }
    };

    const getGrafoMateriaName = (grafoMateriaId: string) => {
        const gm = grafoMaterias.find((item) => item.id === grafoMateriaId);
        if (!gm) return "Materia no encontrada";
        const materia = getMateriaInfo(gm.materiaId);
        return materia ? materia.nombre : "Materia no encontrada";
    };

    const getAvailableMateriasToAssign = () => {
        return materias.filter((materia) => {
            return !grafoMaterias.some((gm) => gm.materiaId === materia.id);
        });
    };

    // Estados de carga / error
    if (!pensumId) {
        return (
            <>
                <AdminNavbar />
                <div className="grafo-academico__state">
                    <div className="grafo-academico__state-card">
                        <div className="grafo-academico__state-icon">📋</div>
                        <h3>No se encontró el pensum.</h3>
                        <p>El identificador de pensum no está disponible.</p>
                    </div>
                </div>
            </>
        );
    }

    if (!pensum) {
        return (
            <>
                <AdminNavbar />
                <div className="grafo-academico__state">
                    <div className="grafo-academico__state-card">
                        <div className="grafo-academico__spinner" />
                        <h3>Cargando pensum...</h3>
                        <p>Por favor espera mientras cargamos la información.</p>
                    </div>
                </div>
            </>
        );
    }

    if (!carreraId) {
        return (
            <>
                <AdminNavbar />
                <div className="grafo-academico__state">
                    <div className="grafo-academico__state-card">
                        <div className="grafo-academico__state-icon">⚠️</div>
                        <h3>Este pensum no tiene una carrera padre.</h3>
                        <p>Verifica la estructura del árbol académico.</p>
                    </div>
                </div>
            </>
        );
    }

    const availableToAssign = getAvailableMateriasToAssign();

    // Render
    return (
        <>
            <AdminNavbar />

            <div className="grafo-academico">
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="grafo-academico__header">
                    <span className="grafo-academico__eyebrow">📘 Gestión académica</span>
                    <h1 className="grafo-academico__title">{pensum.name}</h1>
                    <p className="grafo-academico__subtitle">
                        Administra el catálogo de materias y configura el pensum académico.
                    </p>

                    <div className="grafo-academico__meta">
                        {carrera && (
                            <div className="grafo-academico__meta-item">
                                <span className="grafo-academico__meta-dot" />
                                Carrera: <strong>{carrera.name}</strong>
                            </div>
                        )}
                        <div className="grafo-academico__meta-item">
                            <span className="grafo-academico__meta-dot" />
                            Materias en catálogo: <strong>{materias.length}</strong>
                        </div>
                        <div className="grafo-academico__meta-item">
                            <span className="grafo-academico__meta-dot" />
                            Materias en pensum: <strong>{grafoMaterias.length}</strong>
                        </div>
                    </div>
                </div>

                {/* ── Layout dos columnas ─────────────────────────────────── */}
                <div className="grafo-academico__layout">

                    {/* ════════════════════════════════════════════════════
                        SECCIÓN 1 — Catálogo de materias de la carrera
                    ════════════════════════════════════════════════════ */}
                    <section className="grafo-academico__section">
                        <div className="grafo-academico__section-header">
                            <h2><IconBook /> Materias de la carrera</h2>
                            <p>Crea y administra las materias generales disponibles para esta carrera.</p>
                        </div>

                        <div className="grafo-academico__section-body">

                            {/* ── Formulario crear materia ──────────────── */}
                            <div className="grafo-academico__block">
                                <h3>Nueva materia</h3>

                                <div className="grafo-academico__form">
                                    <div className="grafo-academico__form-row--three grafo-academico__form-row">
                                        <div className="grafo-academico__field">
                                            <label>Nombre de la materia</label>
                                            <input
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                placeholder="Ej: Cálculo Diferencial"
                                            />
                                        </div>
                                        <div className="grafo-academico__field">
                                            <label>Código</label>
                                            <input
                                                value={codigo}
                                                onChange={(e) => setCodigo(e.target.value)}
                                                placeholder="Ej: MAT101"
                                            />
                                        </div>
                                        <div className="grafo-academico__field">
                                            <label>Créditos</label>
                                            <input
                                                type="number"
                                                value={creditos}
                                                onChange={(e) => setCreditos(Number(e.target.value))}
                                                placeholder="3"
                                                min={1}
                                            />
                                        </div>
                                    </div>

                                    {/* Agregar grupo */}
                                    <div className="grafo-academico__grupo-row">
                                        <div className="grafo-academico__field">
                                            <label>Nombre del grupo</label>
                                            <input
                                                value={grupoNombre}
                                                onChange={(e) => setGrupoNombre(e.target.value)}
                                                placeholder="Ej: Grupo A"
                                            />
                                        </div>
                                        <div className="grafo-academico__field">
                                            <label>Cupos</label>
                                            <input
                                                type="number"
                                                value={grupoCupos}
                                                onChange={(e) => setGrupoCupos(Number(e.target.value))}
                                                placeholder="30"
                                                min={1}
                                            />
                                        </div>
                                        <button
                                            className="grafo-academico__btn grafo-academico__btn--outline grafo-academico__btn--sm"
                                            onClick={addGrupoToForm}
                                            title="Agregar grupo"
                                        >
                                            <IconPlus /> Agregar
                                        </button>
                                    </div>

                                    {/* Lista de grupos */}
                                    {grupos.length > 0 ? (
                                        <div className="grafo-academico__groups">
                                            {grupos.map((grupo, index) => (
                                                <span key={index} className="grafo-academico__group-chip">
                                                    {grupo.nombre} · {grupo.cupos} cupos
                                                    <button onClick={() => removeGrupoFromForm(index)} title="Quitar grupo">
                                                        <IconX />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="grafo-academico__groups-hint">
                                            Agrega al menos un grupo si deseas manejar cupos por grupo.
                                        </p>
                                    )}

                                    <button
                                        className="grafo-academico__btn grafo-academico__btn--primary"
                                        onClick={handleCreateMateria}
                                    >
                                        <IconPlus /> Crear materia
                                    </button>
                                </div>
                            </div>

                            {/* ── Catálogo de materias ─────────────────── */}
                            <div className="grafo-academico__block">
                                <h3>Catálogo ({materias.length})</h3>

                                {materias.length === 0 ? (
                                    <div className="grafo-academico__empty">
                                        <IconEmpty />
                                        <p>Esta carrera todavía no tiene materias creadas.</p>
                                    </div>
                                ) : (
                                    <div className="grafo-academico__catalog">
                                        {materias.map((materia) => (
                                            <div
                                                key={materia.id}
                                                className={`grafo-academico__subject-card${editingMateriaId === materia.id ? " grafo-academico__subject-card--editing" : ""}`}
                                            >
                                                <div className="grafo-academico__subject-main">
                                                    {editingMateriaId === materia.id ? (
                                                        <>
                                                            <div className="grafo-academico__edit-row">
                                                                <div className="grafo-academico__field">
                                                                    <label>Nombre</label>
                                                                    <input
                                                                        value={editNombre}
                                                                        onChange={(e) => setEditNombre(e.target.value)}
                                                                        placeholder="Nombre"
                                                                    />
                                                                </div>
                                                                <div className="grafo-academico__field">
                                                                    <label>Código</label>
                                                                    <input
                                                                        value={editCodigo}
                                                                        onChange={(e) => setEditCodigo(e.target.value)}
                                                                        placeholder="Código"
                                                                    />
                                                                </div>
                                                                <div className="grafo-academico__field">
                                                                    <label>Créditos</label>
                                                                    <input
                                                                        type="number"
                                                                        value={editCreditos}
                                                                        onChange={(e) => setEditCreditos(Number(e.target.value))}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Grupos en edición */}
                                                            <div className="grafo-academico__groups" style={{ marginTop: "0.4rem" }}>
                                                                {editGrupos.length === 0 && (
                                                                    <p className="grafo-academico__groups-hint">Sin grupos.</p>
                                                                )}
                                                                {editGrupos.map((grupo, index) => (
                                                                    <span key={index} className="grafo-academico__group-chip">
                                                                        {grupo.nombre} · {grupo.cupos} cupos
                                                                        <button onClick={() => removeGrupoFromEditMateria(index)} title="Quitar grupo">
                                                                            <IconX />
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                                <button
                                                                    className="grafo-academico__btn grafo-academico__btn--outline grafo-academico__btn--sm"
                                                                    onClick={addGrupoToEditMateria}
                                                                >
                                                                    <IconPlus /> Grupo
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="grafo-academico__subject-meta">
                                                                <span className="grafo-academico__subject-code">{materia.codigo}</span>
                                                                <span className="grafo-academico__subject-name">{materia.nombre}</span>
                                                                <span className="grafo-academico__subject-credits">{materia.creditos} crédito{materia.creditos !== 1 ? "s" : ""}</span>
                                                            </div>
                                                            <div className="grafo-academico__subject-groups">
                                                                {materia.grupos && materia.grupos.length > 0 ? (
                                                                    materia.grupos.map((grupo, i) => (
                                                                        <span key={i} className="grafo-academico__group-chip">
                                                                            {grupo.nombre} · {grupo.cupos} cupos
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="grafo-academico__groups-hint">Sin grupos</span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="grafo-academico__actions">
                                                    {editingMateriaId === materia.id ? (
                                                        <>
                                                            <button
                                                                className="grafo-academico__btn grafo-academico__btn--save grafo-academico__btn--sm"
                                                                onClick={handleEditMateriaCarrera}
                                                            >
                                                                <IconSave /> Guardar
                                                            </button>
                                                            <button
                                                                className="grafo-academico__btn grafo-academico__btn--secondary grafo-academico__btn--sm"
                                                                onClick={() => setEditingMateriaId(null)}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="grafo-academico__btn grafo-academico__btn--edit grafo-academico__btn--sm"
                                                                onClick={() => startEditingMateria(materia)}
                                                                title="Editar materia"
                                                            >
                                                                <IconEdit /> Editar
                                                            </button>
                                                            <button
                                                                className="grafo-academico__btn grafo-academico__btn--danger grafo-academico__btn--sm"
                                                                onClick={() => handleDeleteMateriaCarrera(materia.id)}
                                                                title="Eliminar materia"
                                                            >
                                                                <IconTrash /> Eliminar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════════════════════
                        SECCIÓN 2 — Configuración del pensum
                    ════════════════════════════════════════════════════ */}
                    <section className="grafo-academico__section">
                        <div className="grafo-academico__section-header">
                            <h2><IconLayout /> Configuración del pensum</h2>
                            <p>Asigna materias al pensum, define semestres y establece prerrequisitos.</p>
                        </div>

                        <div className="grafo-academico__section-body">

                            {/* Info strip */}
                            <div className="grafo-academico__info-strip">
                                <span>Pensum: <strong>{pensum.name}</strong></span>
                                {carrera && <span>Carrera: <strong>{carrera.name}</strong></span>}
                            </div>

                            {/* ── Asignar materia al pensum ─────────────── */}
                            <div className="grafo-academico__block">
                                <h3>Asignar materia al pensum</h3>

                                <div className="grafo-academico__form">
                                    <div className="grafo-academico__form-row">
                                        <div className="grafo-academico__field">
                                            <label>Materia de la carrera</label>
                                            <select
                                                value={selectedMateriaId}
                                                onChange={(e) => setSelectedMateriaId(e.target.value)}
                                            >
                                                <option value="">Seleccionar materia…</option>
                                                {availableToAssign.map((materia) => (
                                                    <option key={materia.id} value={materia.id}>
                                                        {materia.codigo} — {materia.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grafo-academico__field">
                                            <label>Semestre</label>
                                            <input
                                                type="number"
                                                value={selectedSemestre}
                                                onChange={(e) => setSelectedSemestre(Number(e.target.value))}
                                                placeholder="1"
                                                min={1}
                                            />
                                        </div>
                                    </div>

                                    {availableToAssign.length === 0 && (
                                        <p className="grafo-academico__groups-hint">
                                            No hay materias disponibles para asignar o todas ya fueron agregadas al pensum.
                                        </p>
                                    )}

                                    <button
                                        className="grafo-academico__btn grafo-academico__btn--save"
                                        onClick={handleAddMateriaToGraph}
                                        disabled={availableToAssign.length === 0}
                                    >
                                        <IconPlus /> Asignar al pensum
                                    </button>
                                </div>
                            </div>

                            {/* ── Asignar prerrequisito ─────────────────── */}
                            <div className="grafo-academico__block">
                                <h3>Asignar prerrequisito</h3>

                                <div className="grafo-academico__form">
                                    <div className="grafo-academico__form-row">
                                        <div className="grafo-academico__field">
                                            <label>Materia del pensum</label>
                                            <select
                                                value={selectedGrafoMateriaId}
                                                onChange={(e) => setSelectedGrafoMateriaId(e.target.value)}
                                            >
                                                <option value="">Seleccionar materia…</option>
                                                {grafoMaterias.map((gm) => {
                                                    const materia = getMateriaInfo(gm.materiaId);
                                                    return (
                                                        <option key={gm.id} value={gm.id}>
                                                            {materia?.nombre || "Materia no encontrada"}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className="grafo-academico__field">
                                            <label>Prerrequisito</label>
                                            <select
                                                value={selectedPrerequisiteId}
                                                onChange={(e) => setSelectedPrerequisiteId(e.target.value)}
                                            >
                                                <option value="">Seleccionar prerrequisito…</option>
                                                {grafoMaterias
                                                    .filter((gm) => gm.id !== selectedGrafoMateriaId)
                                                    .map((gm) => {
                                                        const materia = getMateriaInfo(gm.materiaId);
                                                        return (
                                                            <option key={gm.id} value={gm.id}>
                                                                {materia?.nombre || "Materia no encontrada"}
                                                            </option>
                                                        );
                                                    })}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        className="grafo-academico__btn grafo-academico__btn--primary"
                                        onClick={handleAddPrerequisite}
                                    >
                                        <IconPlus /> Agregar prerrequisito
                                    </button>
                                </div>
                            </div>

                            {/* ── Materias asignadas al pensum ─────────── */}
                            <div className="grafo-academico__block">
                                <h3>Materias en el pensum ({grafoMaterias.length})</h3>

                                {grafoMaterias.length === 0 ? (
                                    <div className="grafo-academico__empty">
                                        <IconEmpty />
                                        <p>Este pensum todavía no tiene materias asignadas.</p>
                                    </div>
                                ) : (
                                    <div className="grafo-academico__catalog">
                                        {grafoMaterias.map((gm) => {
                                            const materia = getMateriaInfo(gm.materiaId);

                                            return (
                                                <div
                                                    key={gm.id}
                                                    className={`grafo-academico__pensum-card${editingGrafoMateriaId === gm.id ? " grafo-academico__pensum-card--editing" : ""}`}
                                                >
                                                    <div className="grafo-academico__pensum-main">
                                                        {/* Encabezado de la materia */}
                                                        {materia ? (
                                                            <div className="grafo-academico__subject-meta">
                                                                <span className="grafo-academico__subject-code">{materia.codigo}</span>
                                                                <span className="grafo-academico__subject-name">{materia.nombre}</span>
                                                                <span className="grafo-academico__subject-credits">{materia.creditos} crédito{materia.creditos !== 1 ? "s" : ""}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="grafo-academico__subject-name">Materia no encontrada</span>
                                                        )}

                                                        {/* Semestre editable */}
                                                        {editingGrafoMateriaId === gm.id ? (
                                                            <div className="grafo-academico__edit-semester-row">
                                                                <div className="grafo-academico__field">
                                                                    <label>Semestre</label>
                                                                    <input
                                                                        type="number"
                                                                        value={editSemestre}
                                                                        onChange={(e) => setEditSemestre(Number(e.target.value))}
                                                                        min={1}
                                                                    />
                                                                </div>
                                                                <button
                                                                    className="grafo-academico__btn grafo-academico__btn--save grafo-academico__btn--sm"
                                                                    onClick={handleEditGrafoMateria}
                                                                    title="Guardar semestre"
                                                                >
                                                                    <IconSave />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <p className="grafo-academico__subject-semester">
                                                                Semestre: <strong>{gm.semestre}</strong>
                                                            </p>
                                                        )}

                                                        {/* Grupos */}
                                                        {materia && (
                                                            <div className="grafo-academico__subject-groups" style={{ marginTop: "0.35rem" }}>
                                                                {materia.grupos && materia.grupos.length > 0
                                                                    ? materia.grupos.map((grupo, i) => (
                                                                        <span key={i} className="grafo-academico__group-chip">
                                                                            {grupo.nombre} · {grupo.cupos} cupos
                                                                        </span>
                                                                    ))
                                                                    : <span className="grafo-academico__groups-hint">Sin grupos</span>
                                                                }
                                                            </div>
                                                        )}

                                                        {/* Prerrequisitos */}
                                                        <div className="grafo-academico__pensum-prereqs">
                                                            <label>Prerrequisitos</label>
                                                            {gm.prerequisitesId.length === 0 ? (
                                                                <p className="grafo-academico__groups-hint">Sin prerrequisitos.</p>
                                                            ) : (
                                                                <div className="grafo-academico__groups">
                                                                    {gm.prerequisitesId.map((id) => (
                                                                        <span key={id} className="grafo-academico__prerequisite-chip">
                                                                            {getGrafoMateriaName(id)}
                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (!graph) return;

                                                                                    try {
                                                                                        await removePrerequisite(gm.id, id, graph.id);

                                                                                        enqueueSnackbar("Prerrequisito eliminado correctamente", {
                                                                                            variant: "success",
                                                                                        });
                                                                                    } catch (error) {
                                                                                        enqueueSnackbar("Ocurrió un error al eliminar el prerrequisito", {
                                                                                            variant: "error",
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                title="Quitar prerrequisito"
                                                                            >
                                                                                <IconX />
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grafo-academico__actions">
                                                        {editingGrafoMateriaId === gm.id ? (
                                                            <button
                                                                className="grafo-academico__btn grafo-academico__btn--secondary grafo-academico__btn--sm"
                                                                onClick={() => setEditingGrafoMateriaId(null)}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="grafo-academico__btn grafo-academico__btn--edit grafo-academico__btn--sm"
                                                                onClick={() => startEditingGrafoMateria(gm)}
                                                                title="Editar semestre"
                                                            >
                                                                <IconEdit /> Semestre
                                                            </button>
                                                        )}
                                                        <button
                                                            className="grafo-academico__btn grafo-academico__btn--danger grafo-academico__btn--sm"
                                                            onClick={() => handleDeleteGrafoMateria(gm)}
                                                            title="Quitar del pensum"
                                                        >
                                                            <IconTrash /> Quitar
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}