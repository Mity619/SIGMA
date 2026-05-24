import { useState } from "react";
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
import type { AcademicGraph, Materia, Grupo } from "../Utils/Graph";

export function useAcademicGraph() {
    const [graph, setGraph] = useState<AcademicGraph | null>(null);
    const [materias, setMaterias] = useState<Materia[]>([]);

    const graphsRef = collection(db, "AcademicGraph");
    const materiasRef = collection(db, "Materias");

    //Obtener grafo usando el childrenId del pensum
    const getGraphById = async (graphId: string) => {
        const ref = doc(db, "AcademicGraph", graphId);
        const data = await getDoc(ref);

        if (!data.exists()) return null;

        const graphData: AcademicGraph = {
            id: data.id,
            ...(data.data() as Omit<AcademicGraph, "id">),
        };

        setGraph(graphData);
        return graphData;
    };

    //Buscar si un pensum ya tiene grafo asociado
    const getGraphByPensumId = async (pensumId: string) => {
        const q = query(graphsRef, where("pensumId", "==", pensumId));
        const data = await getDocs(q);

        if (data.empty) return null;

        const graphDoc = data.docs[0];

        const graphData: AcademicGraph = {
            id: graphDoc.id,
            ...(graphDoc.data() as Omit<AcademicGraph, "id">),
        };

        setGraph(graphData);
        return graphData;
    };

    //Crear un grafo nuevo para un pensum
    const createGraphForPensum = async (pensumId: string, pensumName: string) => {
        const graphDoc = await addDoc(graphsRef, {
            pensumId,
            nombre: `Grafo ${pensumName}`,
        });

        //Guardar el id del grafo en el childrenId del nodo Pensum
        const pensumRef = doc(db, "AcademicNode", pensumId);

        await updateDoc(pensumRef, {
            childrenId: graphDoc.id,
        });

        const newGraph: AcademicGraph = {
            id: graphDoc.id,
            pensumId,
            nombre: `Grafo ${pensumName}`,
        };

        setGraph(newGraph);
        return newGraph;
    };

    //Si el grafo existe, lo trae. Si no existe, lo crea.
    const getOrCreateGraph = async (
        pensumId: string,
        pensumName: string,
        childrenId: string | null
    ) => {
        if (childrenId && childrenId !== "") {
            const existingGraph = await getGraphById(childrenId);

            if (existingGraph) {
                return existingGraph;
            }
        }

        const graphByPensum = await getGraphByPensumId(pensumId);

        if (graphByPensum) {
            const pensumRef = doc(db, "AcademicNode", pensumId);

            await updateDoc(pensumRef, {
                childrenId: graphByPensum.id,
            });

            return graphByPensum;
        }

        return await createGraphForPensum(pensumId, pensumName);
    };

    //Obtener las materias que pertenecen a un grafo
    const getMateriasByGraphId = async (graphId: string) => {
        const q = query(materiasRef, where("graphId", "==", graphId));
        const data = await getDocs(q);

        const list: Materia[] = data.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Materia, "id">),
        }));

        setMaterias(list);
        return list;
    };

    //Crear materia como nodo del grafo
    const addMateria = async (
        graphId: string,
        nombre: string,
        codigo: string,
        creditos: number,
        semestre: number,
        grupos: Grupo[]
    ) => {
        await addDoc(materiasRef, {
            graphId,
            nombre,
            codigo,
            creditos,
            semestre,
            grupos,
            prerequisitesId: [],
        });

        await getMateriasByGraphId(graphId);
    };

    //Editar datos de una materia
    const editMateria = async (
        materiaId: string,
        graphId: string,
        nombre: string,
        codigo: string,
        creditos: number,
        semestre: number,
        grupos: Grupo[]
    ) => {
        const ref = doc(db, "Materias", materiaId);

        await updateDoc(ref, {
            nombre,
            codigo,
            creditos,
            semestre,
            grupos,
        });

        await getMateriasByGraphId(graphId);
    };

    //Eliminar materia y quitarla como prerrequisito de otras materias
    const deleteMateria = async (materiaId: string, graphId: string) => {
        const currentMaterias = await getMateriasByGraphId(graphId);

        for (const materia of currentMaterias) {
            if (materia.prerequisitesId.includes(materiaId)) {
                const ref = doc(db, "Materias", materia.id);

                await updateDoc(ref, {
                    prerequisitesId: materia.prerequisitesId.filter(
                        (id) => id !== materiaId
                    ),
                });
            }
        }

        const materiaRef = doc(db, "Materias", materiaId);
        await deleteDoc(materiaRef);

        await getMateriasByGraphId(graphId);
    };

    //Revisar si una materia depende directa o indirectamente de otra
    const materiaDependsOn = (
        materiaId: string,
        targetId: string,
        materiaList: Materia[]
    ): boolean => {
        const materia = materiaList.find((m) => m.id === materiaId);

        if (!materia) return false;

        for (const prerequisiteId of materia.prerequisitesId) {
            if (prerequisiteId === targetId) return true;

            if (materiaDependsOn(prerequisiteId, targetId, materiaList)) {
                return true;
            }
        }

        return false;
    };

    //Agregar prerrequisito evitando repetidos, autorrelaciones y ciclos
    const addPrerequisite = async (
        materiaId: string,
        prerequisiteId: string,
        graphId: string
    ) => {
        if (materiaId === prerequisiteId) {
            alert("Una materia no puede ser prerrequisito de sí misma.");
            return;
        }

        const currentMaterias = await getMateriasByGraphId(graphId);

        const materia = currentMaterias.find((m) => m.id === materiaId);
        const prerequisite = currentMaterias.find((m) => m.id === prerequisiteId);

        if (!materia || !prerequisite) return;

        if (materia.prerequisitesId.includes(prerequisiteId)) {
            alert("Ese prerrequisito ya fue agregado.");
            return;
        }

        //Si el prerrequisito ya depende de la materia actual, se formaría un ciclo.
        if (materiaDependsOn(prerequisiteId, materiaId, currentMaterias)) {
            alert("El prerrequisito ya depende de la materia actual");
            return;
        }

        const ref = doc(db, "Materias", materiaId);

        await updateDoc(ref, {
            prerequisitesId: [...materia.prerequisitesId, prerequisiteId],
        });

        await getMateriasByGraphId(graphId);
    };

    //Quitar un prerrequisito de una materia
    const removePrerequisite = async (
        materiaId: string,
        prerequisiteId: string,
        graphId: string
    ) => {
        const materia = materias.find((m) => m.id === materiaId);

        if (!materia) return;

        const ref = doc(db, "Materias", materiaId);

        await updateDoc(ref, {
            prerequisitesId: materia.prerequisitesId.filter(
                (id) => id !== prerequisiteId
            ),
        });

        await getMateriasByGraphId(graphId);
    };

    //Validar si un estudiante puede matricular una materia según su historial
    const canEnrollMateria = (materia: Materia, history: string[]) => {
        return materia.prerequisitesId.every((id) => history.includes(id));
    };

    //Obtener materias disponibles para un estudiante
    const getAvailableMaterias = (history: string[]) => {
        return materias.filter((materia) => {
            const alreadyApproved = history.includes(materia.id);

            if (alreadyApproved) return false;

            return canEnrollMateria(materia, history);
        });
    };

    return {
        graph,
        materias,
        getGraphById,
        getGraphByPensumId,
        getOrCreateGraph,
        getMateriasByGraphId,
        addMateria,
        editMateria,
        deleteMateria,
        addPrerequisite,
        removePrerequisite,
        canEnrollMateria,
        getAvailableMaterias,
    };
}