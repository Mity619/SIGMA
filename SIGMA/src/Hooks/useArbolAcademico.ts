import { useEffect, useState } from "react";
import { db } from "../Firebase/config";
import {
    collection,
    addDoc,
    getDocs,
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

    // 🔹 Eliminar nodo
    const deleteNode = async (id: string) => {
        const ref = doc(db, "AcademicNode", id);
        
        const hijos = await getNodesByParentId(id);

        if (hijos && hijos.length > 0) {

            for (const hijo of hijos) {
                await deleteNode(hijo.id);
            }
        }

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