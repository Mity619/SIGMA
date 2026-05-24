import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useArchivo } from "../Hooks/useArbolAcademico";
import { useAcademicGraph } from "../Hooks/useGrafoAcademico";
import type { Materia, Grupo } from "../Utils/Graph";

export default function PensumGraph() {
    const { pensumId } = useParams();

    const { nodes } = useArchivo();

    const {
        graph,
        materias,
        getOrCreateGraph,
        getMateriasByGraphId,
        addMateria,
        editMateria,
        deleteMateria,
        addPrerequisite,
        removePrerequisite,
    } = useAcademicGraph();

    const [nombre, setNombre] = useState("");
    const [codigo, setCodigo] = useState("");
    const [creditos, setCreditos] = useState(3);
    const [semestre, setSemestre] = useState(1);

    const [grupoNombre, setGrupoNombre] = useState("");
    const [grupoCupos, setGrupoCupos] = useState(30);
    const [grupos, setGrupos] = useState<Grupo[]>([]);

    const [selectedMateriaId, setSelectedMateriaId] = useState("");
    const [selectedPrerequisiteId, setSelectedPrerequisiteId] = useState("");

    const [editingMateriaId, setEditingMateriaId] = useState<string | null>(null);
    const [editNombre, setEditNombre] = useState("");
    const [editCodigo, setEditCodigo] = useState("");
    const [editCreditos, setEditCreditos] = useState(3);
    const [editSemestre, setEditSemestre] = useState(1);
    const [editGrupos, setEditGrupos] = useState<Grupo[]>([]);

    const pensum = nodes.find((node) => node.id === pensumId);

    //Cargar o crear el grafo cuando ya se tenga el pensum
    useEffect(() => {
        const loadGraph = async () => {
            if (!pensumId || !pensum) return;

            const currentGraph = await getOrCreateGraph(
                pensum.id,
                pensum.name,
                pensum.childrenId
            );

            await getMateriasByGraphId(currentGraph.id);
        };

        loadGraph();
    }, [pensumId, pensum]);

    const clearForm = () => {
        setNombre("");
        setCodigo("");
        setCreditos(3);
        setSemestre(1);
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

    const handleAddMateria = async () => {
        if (!graph) return;

        if (!nombre.trim() || !codigo.trim()) {
            alert("Debes escribir el nombre y el código de la materia.");
            return;
        }

        await addMateria(
            graph.id,
            nombre,
            codigo,
            creditos,
            semestre,
            grupos
        );

        clearForm();
    };

    const handleDeleteMateria = async (materia: Materia) => {
        if (!graph) return;

        const confirmDelete = confirm(
            `¿Seguro que quieres eliminar la materia ${materia.nombre}?`
        );

        if (!confirmDelete) return;

        await deleteMateria(materia.id, graph.id);
    };

    const handleAddPrerequisite = async () => {
        if (!graph) return;

        if (!selectedMateriaId || !selectedPrerequisiteId) {
            alert("Debes seleccionar una materia y un prerrequisito.");
            return;
        }

        await addPrerequisite(
            selectedMateriaId,
            selectedPrerequisiteId,
            graph.id
        );

        setSelectedMateriaId("");
        setSelectedPrerequisiteId("");
    };

    const getMateriaNombre = (materiaId: string) => {
        const materia = materias.find((m) => m.id === materiaId);
        return materia ? materia.nombre : "Materia no encontrada";
    };

    const startEditingMateria = (materia: Materia) => {
        setEditingMateriaId(materia.id);
        setEditNombre(materia.nombre);
        setEditCodigo(materia.codigo);
        setEditCreditos(materia.creditos);
        setEditSemestre(materia.semestre);
        setEditGrupos(materia.grupos || []);
    };

    const handleEditMateria = async () => {
        if (!graph || !editingMateriaId) return;

        if (!editNombre.trim() || !editCodigo.trim()) {
            alert("Debes escribir el nombre y el código de la materia.");
            return;
        }

        await editMateria(
            editingMateriaId,
            graph.id,
            editNombre,
            editCodigo,
            editCreditos,
            editSemestre,
            editGrupos
        );

        setEditingMateriaId(null);
    };

    const addGrupoToEdit = () => {
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

    const removeGrupoFromEdit = (index: number) => {
        setEditGrupos(editGrupos.filter((_, i) => i !== index));
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

    return (
        <div className="tasks-container">
            <div className="tasks-card">
                <h3>📘 Grafo del pensum: {pensum.name}</h3>

                {graph && (
                    <p style={{ fontSize: "12px", opacity: 0.7 }}>
                        ID del grafo: {graph.id}
                    </p>
                )}

                <hr />

                <h5>Agregar materia</h5>

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

                    <input
                        className="form-control"
                        type="number"
                        value={semestre}
                        onChange={(e) => setSemestre(Number(e.target.value))}
                        placeholder="Semestre"
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
                    onClick={handleAddMateria}
                >
                    Agregar materia
                </button>

                <hr />

                <h5>Asignar prerrequisito</h5>

                <div className="input-group mb-3">
                    <select
                        className="form-select"
                        value={selectedMateriaId}
                        onChange={(e) => setSelectedMateriaId(e.target.value)}
                    >
                        <option value="">Materia</option>

                        {materias.map((materia) => (
                            <option key={materia.id} value={materia.id}>
                                {materia.nombre}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        value={selectedPrerequisiteId}
                        onChange={(e) => setSelectedPrerequisiteId(e.target.value)}
                    >
                        <option value="">Prerrequisito</option>

                        {materias
                            .filter((materia) => materia.id !== selectedMateriaId)
                            .map((materia) => (
                                <option key={materia.id} value={materia.id}>
                                    {materia.nombre}
                                </option>
                            ))}
                    </select>

                    <button
                        className="btn btn-success"
                        onClick={handleAddPrerequisite}
                    >
                        Agregar prerrequisito
                    </button>
                </div>

                <hr />

                <h5>Materias del pensum</h5>

                {materias.length === 0 && (
                    <p style={{ opacity: 0.7 }}>
                        Este pensum todavía no tiene materias.
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
                                            />

                                            <input
                                                className="form-control"
                                                value={editCodigo}
                                                onChange={(e) => setEditCodigo(e.target.value)}
                                            />

                                            <input
                                                className="form-control"
                                                type="number"
                                                value={editCreditos}
                                                onChange={(e) => setEditCreditos(Number(e.target.value))}
                                            />

                                            <input
                                                className="form-control"
                                                type="number"
                                                value={editSemestre}
                                                onChange={(e) => setEditSemestre(Number(e.target.value))}
                                            />

                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={handleEditMateria}
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
                                                    onClick={() => removeGrupoFromEdit(index)}
                                                >
                                                    x
                                                </button>
                                            </span>
                                        ))}

                                        <button
                                            className="btn btn-sm btn-secondary"
                                            style={{ marginLeft: "8px" }}
                                            onClick={addGrupoToEdit}
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
                                            Créditos: {materia.creditos} | Semestre: {materia.semestre}
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
                                    {materia.prerequisitesId.length === 0
                                        ? "Ninguno"
                                        : materia.prerequisitesId.map((id) => (
                                            <span key={id}>
                                                {getMateriaNombre(id)}

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    style={{
                                                        marginLeft: "5px",
                                                        marginRight: "8px",
                                                    }}
                                                    onClick={() => {
                                                        if (!graph) return;

                                                        removePrerequisite(
                                                            materia.id,
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
                                onClick={() => handleDeleteMateria(materia)}
                            >
                                ❌
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}