import { useEffect, useState } from "react";
import { db } from "../Firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "firebase/firestore";
import type { TreeNode, NodeType } from "../Utils/TreeNode";


export function useArchivo() {
    const [nodes, setNodes] = useState<TreeNode[]>([]);

    const nodesRef = collection(db, "AcademicNode");

    // 🔹 Obtener nodos del usuario
    const getNodes = async () => {

        const q = query(nodesRef);
        const data = await getDocs(q);

        const list: TreeNode[] = data.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<TreeNode, "id">),
        }));

        setNodes(list);
    };

    // 🔹 Obtener nodos por parentI
    const getNodesByParentId = async (parentId: string | null) => {

        const q = query(nodesRef, where("parentId", "==", parentId));
        const data = await getDocs(q);

        const list: TreeNode[] = data.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<TreeNode, "id">),
        }));

        return list;
    };

    // 🔹 Crear nodo
    const addNode = async (
        name: string,
        type: NodeType,
        parentId: string | null,
        childrenId: string | null
    ) => {

        await addDoc(nodesRef, {
            name,
            type,
            parentId,
            childrenId,
        });
    };

    // 🔹 Editar nodo
    const editNode = async (id: string, newName: string) => {
        const ref = doc(db, "AcademicNode", id);

        await updateDoc(ref, {
            name: newName,
        });

        getNodes();
    };

    // 🔹 Eliminar el grafo asociado a un pensum
    const deleteGraphByPensum = async (
        pensumId: string,
        childrenId: string | null
    ) => {
        let graphId = childrenId;

        // Si el pensum no tiene childrenId, intentamos buscar el grafo por pensumId
        if (!graphId || graphId === "") {
            const graphsRef = collection(db, "AcademicGraph");
            const q = query(graphsRef, where("pensumId", "==", pensumId));
            const data = await getDocs(q);

            if (data.empty) return;

            graphId = data.docs[0].id;
        }

        // 1. Eliminar las materias asignadas a ese grafo
        const grafoMateriasRef = collection(db, "GrafoMaterias");
        const qGrafoMaterias = query(
            grafoMateriasRef,
            where("graphId", "==", graphId)
        );

        const grafoMateriasData = await getDocs(qGrafoMaterias);

        for (const grafoMateria of grafoMateriasData.docs) {
            await deleteDoc(doc(db, "GrafoMaterias", grafoMateria.id));
        }

        // 2. Eliminar el documento del grafo
        await deleteDoc(doc(db, "AcademicGraph", graphId));
    };

    // 🔹 Eliminar nodo del árbol
    const deleteNode = async (id: string) => {
        const ref = doc(db, "AcademicNode", id);

        // Primero obtenemos el nodo actual para saber si es Facultad, Carrera o Pensum
        const nodeSnap = await getDoc(ref);

        if (!nodeSnap.exists()) return;

        const currentNode = {
            id: nodeSnap.id,
            ...(nodeSnap.data() as Omit<TreeNode, "id">),
        };

        // Primero eliminamos los hijos del nodo actual
        const hijos = await getNodesByParentId(id);

        if (hijos && hijos.length > 0) {
            for (const hijo of hijos) {
                await deleteNode(hijo.id);
            }
        }

        // Si el nodo actual es un Pensum, también eliminamos su grafo
        if (currentNode.type === "Pensum") {
            await deleteGraphByPensum(
                currentNode.id,
                currentNode.childrenId
            );
        }

        // Finalmente eliminamos el nodo del árbol
        await deleteDoc(ref);

        getNodes();
    };

    useEffect(() => {

        getNodes();

    }, []);

    return {
        nodes,
        addNode,
        editNode,
        deleteNode,
        getNodesByParentId,
        refresh: getNodes,
    };

}