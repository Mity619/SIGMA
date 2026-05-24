import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useArchivo } from "../Hooks/useArbolAcademico";
import { useAcademicGraph } from "../Hooks/useGrafoAcademico";
import type { Grupo, GrafoMateria, Materia } from "../Utils/Graph";

export default function GrafoAcademico() {
    const { pensumId } = useParams();

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
        if (!grupoNombre.trim()) {
            alert("Debes escribir el nombre del grupo.");
            return;
        }

        const newGrupo: Grupo = {
            nombre: grupoNombre,
            cupos: grupoCupos,
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

        if (!nombre.trim() || !codigo.trim()) {
            alert("Debes escribir el nombre y el código de la materia.");
            return;
        }

        await addMateriaToCarrera(
            carreraId,
            nombre,
            codigo,
            creditos,
            grupos
        );

        clearMateriaForm();
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

        if (!editNombre.trim() || !editCodigo.trim()) {
            alert("Debes escribir el nombre y el código de la materia.");
            return;
        }

        await editMateriaCarrera(
            editingMateriaId,
            carreraId,
            editNombre,
            editCodigo,
            editCreditos,
            editGrupos
        );

        setEditingMateriaId(null);
    };

    const handleDeleteMateriaCarrera = async (materiaId: string) => {
        if (!carreraId) return;

        const confirmDelete = confirm(
            "¿Seguro que quieres eliminar esta materia de la carrera?"
        );

        if (!confirmDelete) return;

        await deleteMateriaCarrera(materiaId, carreraId);
    };

    const addGrupoToEditMateria = () => {
        const nombreGrupo = prompt("Nombre del grupo:");
        if (!nombreGrupo) return;

        const cuposGrupo = Number(prompt("Cupos del grupo:"));
        if (!cuposGrupo) return;

        const newGrupo: Grupo = {
            nombre: nombreGrupo,
            cupos: cuposGrupo,
        };

        setEditGrupos([...editGrupos, newGrupo]);
    };

    const removeGrupoFromEditMateria = (index: number) => {
        setEditGrupos(editGrupos.filter((_, i) => i !== index));
    };

    const handleAddMateriaToGraph = async () => {
        if (!graph) return;

        if (!selectedMateriaId) {
            alert("Debes seleccionar una materia.");
            return;
        }

        await addMateriaToGraph(
            graph.id,
            selectedMateriaId,
            selectedSemestre
        );

        setSelectedMateriaId("");
        setSelectedSemestre(1);
    };

    const handleAddPrerequisite = async () => {
        if (!graph) return;

        if (!selectedGrafoMateriaId || !selectedPrerequisiteId) {
            alert("Debes seleccionar una materia y un prerrequisito.");
            return;
        }

        await addPrerequisite(
            selectedGrafoMateriaId,
            selectedPrerequisiteId,
            graph.id
        );

        setSelectedGrafoMateriaId("");
        setSelectedPrerequisiteId("");
    };

    const handleDeleteGrafoMateria = async (gm: GrafoMateria) => {
        if (!graph) return;

        const materia = getMateriaInfo(gm.materiaId);

        const confirmDelete = confirm(
            `¿Seguro que quieres quitar ${materia?.nombre || "esta materia"} del pensum?`
        );

        if (!confirmDelete) return;

        await deleteGrafoMateria(gm.id, graph.id);
    };

    const startEditingGrafoMateria = (gm: GrafoMateria) => {
        setEditingGrafoMateriaId(gm.id);
        setEditSemestre(gm.semestre);
    };

    const handleEditGrafoMateria = async () => {
        if (!graph || !editingGrafoMateriaId) return;

        await editGrafoMateria(
            editingGrafoMateriaId,
            graph.id,
            editSemestre
        );

        setEditingGrafoMateriaId(null);
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

    if (!pensumId) {
        return (
            <div className="tasks-container">
                <div className="tasks-card">
                    <h3>No se encontró el pensum.</h3>
                </div>
            </div>
        );
    }

    if (!pensum) {
        return (
            <div className="tasks-container">
                <div className="tasks-card">
                    <h3>Cargando pensum...</h3>
                </div>
            </div>
        );
    }

    if (!carreraId) {
        return (
            <div className="tasks-container">
                <div className="tasks-card">
                    <h3>Este pensum no tiene una carrera padre.</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="tasks-container">
            <div className="tasks-card">
                <h3>📘 Grafo del pensum: {pensum.name}</h3>

                {carrera && (
                    <p style={{ fontSize: "13px", opacity: 0.8 }}>
                        Carrera: {carrera.name}
                    </p>
                )}

                {graph && (
                    <p style={{ fontSize: "12px", opacity: 0.7 }}>
                        ID del grafo: {graph.id}
                    </p>
                )}

                <hr />

                <h5>Crear materia para la carrera</h5>

                <div className="input-group mb-3">
                    <input
                        className="form-control"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre de la materia"
                    />

                    <input
                        className="form-control"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        placeholder="Código"
                    />

                    <input
                        className="form-control"
                        type="number"
                        value={creditos}
                        onChange={(e) => setCreditos(Number(e.target.value))}
                        placeholder="Créditos"
                    />
                </div>

                <h6>Grupos de la materia</h6>

                <div className="input-group mb-2">
                    <input
                        className="form-control"
                        value={grupoNombre}
                        onChange={(e) => setGrupoNombre(e.target.value)}
                        placeholder="Nombre del grupo. Ej: Grupo A"
                    />

                    <input
                        className="form-control"
                        type="number"
                        value={grupoCupos}
                        onChange={(e) => setGrupoCupos(Number(e.target.value))}
                        placeholder="Cupos"
                    />

                    <button
                        className="btn btn-secondary"
                        onClick={addGrupoToForm}
                    >
                        Agregar grupo
                    </button>
                </div>

                {grupos.length > 0 && (
                    <div className="mb-3">
                        {grupos.map((grupo, index) => (
                            <span
                                key={index}
                                style={{ marginRight: "10px", fontSize: "13px" }}
                            >
                                {grupo.nombre} ({grupo.cupos} cupos)

                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    style={{ marginLeft: "5px" }}
                                    onClick={() => removeGrupoFromForm(index)}
                                >
                                    x
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <button
                    className="btn btn-primary mb-3"
                    onClick={handleCreateMateria}
                >
                    Crear materia en la carrera
                </button>

                <hr />

                <h5>Materias de la carrera</h5>

                {materias.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        Esta carrera todavía no tiene materias creadas.
                    </p>
                )}

                {materias.map((materia) => (
                    <div key={materia.id} className="task-item">
                        <div className="left">
                            <div>
                                {editingMateriaId === materia.id ? (
                                    <>
                                        <div className="input-group mb-2">
                                            <input
                                                className="form-control"
                                                value={editNombre}
                                                onChange={(e) => setEditNombre(e.target.value)}
                                                placeholder="Nombre"
                                            />

                                            <input
                                                className="form-control"
                                                value={editCodigo}
                                                onChange={(e) => setEditCodigo(e.target.value)}
                                                placeholder="Código"
                                            />

                                            <input
                                                className="form-control"
                                                type="number"
                                                value={editCreditos}
                                                onChange={(e) => setEditCreditos(Number(e.target.value))}
                                                placeholder="Créditos"
                                            />

                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={handleEditMateriaCarrera}
                                            >
                                                💾
                                            </button>
                                        </div>

                                        <p style={{ margin: 0, fontSize: "13px" }}>
                                            Grupos:
                                        </p>

                                        {editGrupos.length === 0 && (
                                            <p style={{ margin: 0, fontSize: "13px", opacity: 0.7 }}>
                                                Sin grupos
                                            </p>
                                        )}

                                        {editGrupos.map((grupo, index) => (
                                            <span
                                                key={index}
                                                style={{ marginRight: "10px", fontSize: "13px" }}
                                            >
                                                {grupo.nombre} ({grupo.cupos} cupos)

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    style={{ marginLeft: "5px" }}
                                                    onClick={() => removeGrupoFromEditMateria(index)}
                                                >
                                                    x
                                                </button>
                                            </span>
                                        ))}

                                        <button
                                            className="btn btn-sm btn-secondary"
                                            style={{ marginLeft: "8px" }}
                                            onClick={addGrupoToEditMateria}
                                        >
                                            Agregar grupo
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <strong>
                                            {materia.codigo} - {materia.nombre}
                                        </strong>

                                        <p style={{ margin: 0, fontSize: "13px" }}>
                                            Créditos: {materia.creditos}
                                        </p>

                                        <p style={{ margin: 0, fontSize: "13px" }}>
                                            Grupos:{" "}
                                            {materia.grupos && materia.grupos.length > 0
                                                ? materia.grupos
                                                    .map((grupo) => `${grupo.nombre} (${grupo.cupos} cupos)`)
                                                    .join(", ")
                                                : "Sin grupos"}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="actions">
                            {editingMateriaId === materia.id ? (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setEditingMateriaId(null)}
                                >
                                    Cancelar
                                </button>
                            ) : (
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => startEditingMateria(materia)}
                                >
                                    ✏️
                                </button>
                            )}

                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteMateriaCarrera(materia.id)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}

                <hr />

                <h5>Asignar materia al pensum</h5>

                <div className="input-group mb-3">
                    <select
                        className="form-select"
                        value={selectedMateriaId}
                        onChange={(e) => setSelectedMateriaId(e.target.value)}
                    >
                        <option value="">Materia de la carrera</option>

                        {getAvailableMateriasToAssign().map((materia) => (
                            <option key={materia.id} value={materia.id}>
                                {materia.codigo} - {materia.nombre}
                            </option>
                        ))}
                    </select>

                    <input
                        className="form-control"
                        type="number"
                        value={selectedSemestre}
                        onChange={(e) => setSelectedSemestre(Number(e.target.value))}
                        placeholder="Semestre"
                    />

                    <button
                        className="btn btn-success"
                        onClick={handleAddMateriaToGraph}
                    >
                        Asignar al pensum
                    </button>
                </div>

                <hr />

                <h5>Asignar prerrequisito</h5>

                <div className="input-group mb-3">
                    <select
                        className="form-select"
                        value={selectedGrafoMateriaId}
                        onChange={(e) => setSelectedGrafoMateriaId(e.target.value)}
                    >
                        <option value="">Materia del pensum</option>

                        {grafoMaterias.map((gm) => {
                            const materia = getMateriaInfo(gm.materiaId);

                            return (
                                <option key={gm.id} value={gm.id}>
                                    {materia?.nombre || "Materia no encontrada"}
                                </option>
                            );
                        })}
                    </select>

                    <select
                        className="form-select"
                        value={selectedPrerequisiteId}
                        onChange={(e) => setSelectedPrerequisiteId(e.target.value)}
                    >
                        <option value="">Prerrequisito</option>

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

                    <button
                        className="btn btn-success"
                        onClick={handleAddPrerequisite}
                    >
                        Agregar prerrequisito
                    </button>
                </div>

                <hr />

                <h5>Materias asignadas al pensum</h5>

                {grafoMaterias.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        Este pensum todavía no tiene materias asignadas.
                    </p>
                )}

                {grafoMaterias.map((gm) => {
                    const materia = getMateriaInfo(gm.materiaId);

                    return (
                        <div key={gm.id} className="task-item">
                            <div className="left">
                                <div>
                                    <strong>
                                        {materia
                                            ? `${materia.codigo} - ${materia.nombre}`
                                            : "Materia no encontrada"}
                                    </strong>

                                    {editingGrafoMateriaId === gm.id ? (
                                        <div className="input-group mt-2 mb-2">
                                            <input
                                                className="form-control"
                                                type="number"
                                                value={editSemestre}
                                                onChange={(e) => setEditSemestre(Number(e.target.value))}
                                            />

                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={handleEditGrafoMateria}
                                            >
                                                💾
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: "13px" }}>
                                            Semestre: {gm.semestre}
                                        </p>
                                    )}

                                    {materia && (
                                        <>
                                            <p style={{ margin: 0, fontSize: "13px" }}>
                                                Créditos: {materia.creditos}
                                            </p>

                                            <p style={{ margin: 0, fontSize: "13px" }}>
                                                Grupos:{" "}
                                                {materia.grupos && materia.grupos.length > 0
                                                    ? materia.grupos
                                                        .map((grupo) => `${grupo.nombre} (${grupo.cupos} cupos)`)
                                                        .join(", ")
                                                    : "Sin grupos"}
                                            </p>
                                        </>
                                    )}

                                    <p style={{ margin: 0, fontSize: "13px" }}>
                                        Prerrequisitos:{" "}
                                        {gm.prerequisitesId.length === 0
                                            ? "Ninguno"
                                            : gm.prerequisitesId.map((id) => (
                                                <span key={id}>
                                                    {getGrafoMateriaName(id)}

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        style={{
                                                            marginLeft: "5px",
                                                            marginRight: "8px",
                                                        }}
                                                        onClick={() => {
                                                            if (!graph) return;

                                                            removePrerequisite(
                                                                gm.id,
                                                                id,
                                                                graph.id
                                                            );
                                                        }}
                                                    >
                                                        x
                                                    </button>
                                                </span>
                                            ))}
                                    </p>
                                </div>
                            </div>

                            <div className="actions">
                                {editingGrafoMateriaId === gm.id ? (
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditingGrafoMateriaId(null)}
                                    >
                                        Cancelar
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => startEditingGrafoMateria(gm)}
                                    >
                                        ✏️
                                    </button>
                                )}

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteGrafoMateria(gm)}
                                >
                                    Quitar del pensum
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}