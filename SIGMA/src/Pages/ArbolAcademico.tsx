import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { useArchivo } from "../Hooks/useArbolAcademico";
import AuthContext from "../Context/AuthContext";

export default function ArbolAcademico() {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [type, setType] = useState<"Facultad" | "Carrera" | "Pensum">("Facultad");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [selectedParent, setSelectedParent] = useState<string | null>(null);
    if (!auth) return null;
    const { user, logout } = auth;
    const { nodes, addNode, deleteNode, editNode, refresh } = useArchivo();
    // Construcción del árbol (recursivo)
   function buildTree(nodes: any[], parentId: string | null = null): any[] {
        return nodes
            .filter((node) => node.parentId === parentId)
            .map((node) => ({
              ...node,
              children: buildTree(nodes, node.id),
            }));
    }
    const tree = buildTree(nodes);
    // Reglas de jerarquía
    const canHaveChildren = (type: string) => type === "Facultad" || type === "Carrera";
    const getChildType = (parentType: string | null): "Facultad" | "Carrera" | "Pensum" | null => {
        if (!parentType) return "Facultad";
        if (parentType === "Facultad") return "Carrera";
        if (parentType === "Carrera") return "Pensum";
        return null;
    };

    const openPensumGraph = (node: any) => {
        if (node.type !== "Pensum") return;

        navigate(`/Dashboard/GrafoAcademico/${node.id}`);
    };

    const TreeNodeComponent = ({ node }: any) => {
        const isFolder = canHaveChildren(node.type);
        const childType = getChildType(node.type);
        return (
            <div style={{ marginLeft: "20px" }}>
                <div className="task-item">
                    <div className="left">
                        <span
                            style={{ cursor: isFolder ? "pointer" : "default" }}
                            onClick={() => {
                                if (isFolder) setSelectedParent(node.id);
                            }}
                        >
                            {node.type === "Facultad" && "🏛️"}
                            {node.type === "Carrera" && "📚"}
                            {node.type === "Pensum" && "📖"}
                        </span>
                        {editingId === node.id ? (
                            <input
                                className="form-control"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        ) : (
                        <span
                            style={{
                                cursor: node.type === "Pensum" ? "pointer" : "default",
                            }}
                            onClick={() => openPensumGraph(node)}
                        >
                            {node.name}

                            {node.type === "Pensum" && !node.childrenId && (
                                    <small style={{ marginLeft: "8px", color: "gray" }}>
                                        (Vacio)
                                    </small>
                                )}
                        </span>
                        )}
                    </div>
                    <div className="actions">
                        {isFolder && childType && (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setSelectedParent(node.id)}
                                title={`Crear ${childType}`}
                            >
                              ➕
                            </button>
                        )}
                        {editingId === node.id ? (
                            <button
                                className="btn btn-success btn-sm"
                                onClick={async () => {
                                    await editNode(node.id, editName);
                                    setEditingId(null);
                                }}
                            >
                              💾
                            </button>
                        ) : (
                            <button
                                className="btn btn-warning btn-sm"
                                onClick={() => {
                                    setEditingId(node.id);
                                    setEditName(node.name);
                                }}
                            >
                              ✏️
                            </button>
                        )}
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                                await deleteNode(node.id);
                            }}
                        >
                        ❌
                        </button>
                    </div>
                </div>
                {node.children.map((child: any) => (
                    <TreeNodeComponent key={child.id} node={child} />
                ))}
            </div>
        );
    };

    const handleAdd = async () => {
        if (!name.trim()) return;
        let allowedType: "Facultad" | "Carrera" | "Pensum" | null = null;
        if (!selectedParent) {
            allowedType = "Facultad";
        } else {
            const parentNode = nodes.find((n) => n.id === selectedParent);
            if (parentNode) {
                allowedType = getChildType(parentNode.type);
            }
        }
        if (!allowedType || allowedType !== type) {
            alert(`No puedes crear un(a) ${type} aquí. Debes crear un(a) ${allowedType}.`);
            return;
        }
        const childrenId = type === "Pensum" ? "" : null;
        await addNode(name, type, selectedParent, childrenId);
        setName("");
        setSelectedParent(null);
        await refresh();
    };

    return (
        <div className="tasks-container">
            <div className="tasks-card">
                <div className="d-flex justify-content-between mb-3">
                    <h3>🌳 Árbol Académico - Administración Global</h3>
                    <button className="btn btn-danger btn-sm" onClick={logout}>
                        Cerrar sesión
                    </button>
                </div>
                <div className="input-group mb-3">
                    <input
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={
                            selectedParent
                              ? `Nuevo elemento dentro de ${nodes.find(n => n.id === selectedParent)?.name || "la carpeta"}`
                              : "Nueva Facultad (raíz)"
                        }
                    />
                    <select
                        className="form-select"
                        value={type}
                        onChange={(e) => setType(e.target.value as "Facultad" | "Carrera" | "Pensum")}
                    >
                        <option value="Facultad">Facultad</option>
                        <option value="Carrera">Carrera</option>
                        <option value="Pensum">Pensum</option>
                    </select>
                    <button className="btn btn-primary" onClick={handleAdd}>
                        Agregar
                    </button>
                </div>
                {selectedParent && (
                    <p style={{ fontSize: "12px", opacity: 0.7 }}>
                        Creando dentro de: {nodes.find(n => n.id === selectedParent)?.name}
                    </p>
                )}
                {tree.map((node) => (
                    <TreeNodeComponent key={node.id} node={node} />
                ))}
            </div>
        </div>
    );
}