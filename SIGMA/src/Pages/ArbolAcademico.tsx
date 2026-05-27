import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { closeSnackbar, useSnackbar } from 'notistack';
import type { KeyboardEvent } from "react";
import { useArchivo } from "../Hooks/useArbolAcademico";
import AuthContext from "../Context/AuthContext";
import AdminNavbar from "../Components/AdminNavbar";
import "./SCSS/ArbolAcademico.scss";

// Íconos SVG inline

const IconFacultad = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCarrera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconPensum = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="14 2 14 8 20 8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconAdd = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSave = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline
      points="20 6 9 17 4 12"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconDelete = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline
      points="3 6 5 6 21 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 12h14M12 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconEmpty = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 17.5h7M17.5 14v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Componente principal

export default function ArbolAcademico() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  if (!auth) return null;

  const { nodes, addNode, deleteNode, editNode, refresh } = useArchivo();

  // Construcción recursiva del árbol
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

  // Tipo esperado según el padre seleccionado
  const expectedType: "Facultad" | "Carrera" | "Pensum" = selectedParent
    ? getChildType(nodes.find((n) => n.id === selectedParent)?.type ?? null) ?? "Facultad"
    : "Facultad";

  const parentName = selectedParent
    ? nodes.find((n) => n.id === selectedParent)?.name
    : null;

  const openPensumGraph = (node: any) => {
    if (node.type !== "Pensum") return;

    navigate(`/Dashboard/GrafoAcademico/${node.id}`);
  };

  // Agregar nodo
  const handleAdd = async () => {
    if (!name.trim()) {
      enqueueSnackbar("Debes ingresar un nombre antes de crear el elemento", {
        variant: "warning",
      });
      return;
    }

    let allowedType: "Facultad" | "Carrera" | "Pensum" | null = null;

    if (!selectedParent) {
      allowedType = "Facultad";
    } else {
      const parentNode = nodes.find((n) => n.id === selectedParent);

      if (parentNode) {
        allowedType = getChildType(parentNode.type);
      }
    }

    if (!allowedType || allowedType !== expectedType) {
      enqueueSnackbar(
        `No puedes crear un(a) ${expectedType} aquí. Debes crear un(a) ${allowedType}.`,
        { variant: "warning" }
      );
      return;
    }

    const childrenId = expectedType === "Pensum" ? "" : null;

    try {
      await addNode(name, expectedType, selectedParent, childrenId);

      if (expectedType === "Facultad") {
        enqueueSnackbar("Facultad creada correctamente", {
          variant: "success",
        });
      }

      if (expectedType === "Carrera") {
        enqueueSnackbar("Carrera creada correctamente", {
          variant: "success",
        });
      }

      if (expectedType === "Pensum") {
        enqueueSnackbar("Pensum creado correctamente", {
          variant: "success",
        });
      }

      setName("");
      setSelectedParent(null);
      await refresh();
    } catch (error) {
      enqueueSnackbar("Ocurrió un error al crear el elemento", {
        variant: "error",
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

const handleSaveEdit = async (nodeId: string) => {
  if (!editName.trim()) {
    enqueueSnackbar("El nombre no puede quedar vacío", {
      variant: "warning",
    });
    return;
  }

  try {
    await editNode(nodeId, editName.trim());
    setEditingId(null);
    setEditName("");

    enqueueSnackbar("Elemento actualizado correctamente", {
      variant: "success",
    });

    await refresh();
  } catch (error) {
    enqueueSnackbar("Ocurrió un error al actualizar el elemento", {
      variant: "error",
    });
  }
};

  const handleDeleteNode = (node: any) => {
    enqueueSnackbar(
      `¿Seguro que quieres eliminar "${node.name}"? Si tiene elementos relacionados también se eliminarán.`,
      {
        variant: "warning",
        persist: true,
        action: (snackbarId) => (
          <div className="arbol-academico__snackbar-actions">
            <button
              type="button"
              className="arbol-academico__snackbar-btn arbol-academico__snackbar-btn--danger"
              onClick={async () => {
                closeSnackbar(snackbarId);

                try {
                  await deleteNode(node.id);

                  enqueueSnackbar("Elemento eliminado correctamente", {
                    variant: "success",
                  });

                  await refresh();
                } catch (error) {
                  enqueueSnackbar("Ocurrió un error al eliminar el elemento", {
                    variant: "error",
                  });
                }
              }}
            >
              Eliminar
            </button>

            <button
              type="button"
              className="arbol-academico__snackbar-btn arbol-academico__snackbar-btn--secondary"
              onClick={() => closeSnackbar(snackbarId)}
            >
              Cancelar
            </button>
          </div>
        ),
      }
    );
  };

  // Nodo individual del árbol
  const TreeNodeComponent = ({ node, depth = 0 }: { node: any; depth?: number }) => {
    const isFolder = canHaveChildren(node.type);
    const childType = getChildType(node.type);
    const isPensum = node.type === "Pensum";
    const isSelected = selectedParent === node.id;

    return (
      <div className={`arbol-academico__branch arbol-academico__branch--depth-${Math.min(depth, 2)}`}>
        <div
          className={[
            "arbol-academico__node",
            `arbol-academico__node--${node.type.toLowerCase()}`,
            isPensum ? "arbol-academico__node--pensum-clickable" : "",
            isSelected ? "arbol-academico__node--selected" : "",
          ].join(" ")}
        >
          <div
            className={`arbol-academico__node-icon arbol-academico__node-icon--${node.type.toLowerCase()}`}
            onClick={() => {
              if (isFolder) setSelectedParent(node.id);
            }}
          >
            {node.type === "Facultad" && <IconFacultad />}
            {node.type === "Carrera" && <IconCarrera />}
            {node.type === "Pensum" && <IconPensum />}
          </div>

          <div className="arbol-academico__node-content">
            {editingId === node.id ? (
              <input
                className="arbol-academico__edit-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await handleSaveEdit(node.id);
                  }

                  if (e.key === "Escape") {
                    setEditingId(null);
                    setEditName("");
                  }
                }}
              />
            ) : (
              <div className="arbol-academico__node-label">
                <span
                  className="arbol-academico__node-name"
                  onClick={() => openPensumGraph(node)}
                >
                  {node.name}
                </span>

                <span className={`arbol-academico__node-type-badge arbol-academico__node-type-badge--${node.type.toLowerCase()}`}>
                  {node.type}
                </span>

                {isPensum && !node.childrenId && (
                  <span className="arbol-academico__node-empty-tag">
                    Vacío
                  </span>
                )}

                {isPensum && (
                  <span
                    className="arbol-academico__node-arrow"
                    onClick={() => openPensumGraph(node)}
                  >
                    <IconArrow />
                    Ver grafo
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="arbol-academico__actions">
            {isFolder && childType && (
              <button
                className={`arbol-academico__action-btn arbol-academico__action-btn--add ${
                  isSelected ? "arbol-academico__action-btn--add-active" : ""
                }`}
                onClick={() => setSelectedParent(isSelected ? null : node.id)}
                title={`Crear ${childType}`}
              >
                <IconAdd />
              </button>
            )}

            {editingId === node.id ? (
              <button
                className="arbol-academico__action-btn arbol-academico__action-btn--save"
                onClick={() => handleSaveEdit(node.id)}
                title="Guardar"
              >
                <IconSave />
              </button>
            ) : (
              <button
                className="arbol-academico__action-btn arbol-academico__action-btn--edit"
                onClick={() => {
                  setEditingId(node.id);
                  setEditName(node.name);
                }}
                title="Editar"
              >
                <IconEdit />
              </button>
            )}

              <button
                className="arbol-academico__action-btn arbol-academico__action-btn--delete"
                onClick={() => handleDeleteNode(node)}
                title="Eliminar"
              >
                <IconDelete />
              </button>
          </div>
        </div>

        {node.children.length > 0 && (
          <div className="arbol-academico__children">
            {node.children.map((child: any) => (
              <TreeNodeComponent key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="arbol-academico">
      <AdminNavbar />

      <main className="arbol-academico__main">
        <header className="arbol-academico__header">
          <div className="arbol-academico__header-badge">
            Administración Académica
          </div>

          <h1 className="arbol-academico__title">
            Árbol Académico
          </h1>

          <p className="arbol-academico__subtitle">
            Gestiona facultades, carreras y pensums del sistema académico.
          </p>
        </header>

        <section className="arbol-academico__form-card">
          <h2 className="arbol-academico__form-title">
            {parentName
              ? `Crear dentro de: ${parentName}`
              : "Crear nueva Facultad"}
          </h2>

          <div className="arbol-academico__form-row">
            <input
              className="arbol-academico__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                parentName
                  ? `Nombre del nuevo elemento en "${parentName}"`
                  : "Nombre de la nueva facultad"
              }
            />

            <select
              className="arbol-academico__select"
              value={expectedType}
              disabled
            >
              <option value="Facultad">Facultad</option>
              <option value="Carrera">Carrera</option>
              <option value="Pensum">Pensum</option>
            </select>

            <button
              className="arbol-academico__btn-add"
              onClick={handleAdd}
              disabled={!name.trim()}
            >
              <IconAdd />
              Agregar
            </button>
          </div>

          {selectedParent && (
            <div className="arbol-academico__form-context">
              <span>
                Creando <strong>{expectedType}</strong> dentro de{" "}
                <strong>{parentName}</strong>
              </span>

              <button
                className="arbol-academico__form-clear"
                onClick={() => setSelectedParent(null)}
              >
                Cancelar
              </button>
            </div>
          )}
        </section>

        <section className="arbol-academico__tree">
          {tree.length === 0 ? (
            <div className="arbol-academico__empty">
              <div className="arbol-academico__empty-icon">
                <IconEmpty />
              </div>

              <p className="arbol-academico__empty-title">
                No hay facultades creadas
              </p>

              <p className="arbol-academico__empty-desc">
                Crea la primera facultad usando el formulario de arriba para comenzar a estructurar el árbol académico.
              </p>
            </div>
          ) : (
            tree.map((node) => (
              <TreeNodeComponent key={node.id} node={node} depth={0} />
            ))
          )}
        </section>
      </main>
    </div>
  );
}