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
import type {
    AcademicGraph,
    Materia,
    Grupo,
    GrafoMateria
} from "../Utils/Graph";

export function useAcademicGraph() {
    const [graph, setGraph] = useState<AcademicGraph | null>(null);

    // Materias generales de la carrera.
    const [materias, setMaterias] = useState<Materia[]>([]);

    // Materias asignadas al grafo del pensum.
    const [grafoMaterias, setGrafoMaterias] = useState<GrafoMateria[]>([]);

    const graphsRef = collection(db, "AcademicGraph");
    const materiasRef = collection(db, "Materias");
    const grafoMateriasRef = collection(db, "GrafoMaterias");

    // 🔹 Obtener un grafo por su id
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

    // 🔹 Buscar si un pensum ya tiene grafo
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

    // 🔹 Crear grafo para un pensum
    const createGraphForPensum = async (
        pensumId: string,
        pensumName: string,
        carreraId: string
    ) => {
        const graphDoc = await addDoc(graphsRef, {
            pensumId,
            carreraId,
            nombre: `Grafo ${pensumName}`,
        });

        // Guardamos el id del grafo en el childrenId del pensum.
        const pensumRef = doc(db, "AcademicNode", pensumId);

        await updateDoc(pensumRef, {
            childrenId: graphDoc.id,
        });

        const newGraph: AcademicGraph = {
            id: graphDoc.id,
            pensumId,
            carreraId,
            nombre: `Grafo ${pensumName}`,
        };

        setGraph(newGraph);
        return newGraph;
    };

    // 🔹 Obtener o crear grafo
    const getOrCreateGraph = async (
        pensumId: string,
        pensumName: string,
        carreraId: string,
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

        return await createGraphForPensum(pensumId, pensumName, carreraId);
    };

    // 🔹 Obtener materias generales de una carrera
    const getMateriasByCarreraId = async (carreraId: string) => {
        const q = query(materiasRef, where("carreraId", "==", carreraId));
        const data = await getDocs(q);

        const list: Materia[] = data.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Materia, "id">),
        }));

        setMaterias(list);
        return list;
    };

    // 🔹 Crear materia general para una carrera
    const addMateriaToCarrera = async (
        carreraId: string,
        nombre: string,
        codigo: string,
        creditos: number,
        grupos: Grupo[]
    ) => {
        await addDoc(materiasRef, {
            carreraId,
            nombre,
            codigo,
            creditos,
            grupos,
        });

        await getMateriasByCarreraId(carreraId);
    };

    // 🔹 Editar materia general de una carrera
    const editMateriaCarrera = async (
        materiaId: string,
        carreraId: string,
        nombre: string,
        codigo: string,
        creditos: number,
        grupos: Grupo[]
    ) => {
        const ref = doc(db, "Materias", materiaId);

        await updateDoc(ref, {
            nombre,
            codigo,
            creditos,
            grupos,
        });

        await getMateriasByCarreraId(carreraId);
    };

    // 🔹 Revisar si una materia está asignada a algún pensum
    const materiaIsAssigned = async (materiaId: string) => {
        const q = query(
            grafoMateriasRef,
            where("materiaId", "==", materiaId)
        );

        const data = await getDocs(q);

        return !data.empty;
    };

    // 🔹 Eliminar materia general de la carrera
    const deleteMateriaCarrera = async (
        materiaId: string,
        carreraId: string
    ) => {
        const assigned = await materiaIsAssigned(materiaId);

        if (assigned) {
            alert("No puedes eliminar esta materia porque está asignada a uno o más pensums.");
            return;
        }

        const ref = doc(db, "Materias", materiaId);

        await deleteDoc(ref);

        await getMateriasByCarreraId(carreraId);
    };

    // 🔹 Obtener materias asignadas a un grafo
    const getGrafoMateriasByGraphId = async (graphId: string) => {
        const q = query(grafoMateriasRef, where("graphId", "==", graphId));
        const data = await getDocs(q);

        const list: GrafoMateria[] = data.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<GrafoMateria, "id">),
        }));

        setGrafoMaterias(list);
        return list;
    };

    // 🔹 Asignar una materia de la carrera al grafo del pensum
    const addMateriaToGraph = async (
        graphId: string,
        materiaId: string,
        semestre: number
    ) => {
        const currentGrafoMaterias = await getGrafoMateriasByGraphId(graphId);

        const alreadyAdded = currentGrafoMaterias.some(
            (gm) => gm.materiaId === materiaId
        );

        if (alreadyAdded) {
            alert("Esta materia ya está asignada a este pensum.");
            return;
        }

        await addDoc(grafoMateriasRef, {
            graphId,
            materiaId,
            semestre,
            prerequisitesId: [],
        });

        await getGrafoMateriasByGraphId(graphId);
    };

    // 🔹 Cambiar semestre de una materia dentro del grafo
    const editGrafoMateria = async (
        grafoMateriaId: string,
        graphId: string,
        semestre: number
    ) => {
        const ref = doc(db, "GrafoMaterias", grafoMateriaId);

        await updateDoc(ref, {
            semestre,
        });

        await getGrafoMateriasByGraphId(graphId);
    };

    // 🔹 Eliminar una materia del grafo y quitarla como prerrequisito de otras
    const deleteGrafoMateria = async (
        grafoMateriaId: string,
        graphId: string
    ) => {
        const currentGrafoMaterias = await getGrafoMateriasByGraphId(graphId);

        for (const gm of currentGrafoMaterias) {
            if (gm.prerequisitesId.includes(grafoMateriaId)) {
                const ref = doc(db, "GrafoMaterias", gm.id);

                await updateDoc(ref, {
                    prerequisitesId: gm.prerequisitesId.filter(
                        (id) => id !== grafoMateriaId
                    ),
                });
            }
        }

        const ref = doc(db, "GrafoMaterias", grafoMateriaId);
        await deleteDoc(ref);

        await getGrafoMateriasByGraphId(graphId);
    };

    // 🔹 Verifica si una materia del grafo depende de otra
    const grafoMateriaDependsOn = (
        grafoMateriaId: string,
        targetId: string,
        list: GrafoMateria[]
    ): boolean => {
        const grafoMateria = list.find((gm) => gm.id === grafoMateriaId);

        if (!grafoMateria) return false;

        for (const prerequisiteId of grafoMateria.prerequisitesId) {
            if (prerequisiteId === targetId) return true;

            if (grafoMateriaDependsOn(prerequisiteId, targetId, list)) {
                return true;
            }
        }

        return false;
    };

    // 🔹 Agregar prerrequisito evitando ciclos
    const addPrerequisite = async (
        grafoMateriaId: string,
        prerequisiteGrafoMateriaId: string,
        graphId: string
    ) => {
        if (grafoMateriaId === prerequisiteGrafoMateriaId) {
            alert("Una materia no puede ser prerrequisito de sí misma.");
            return;
        }

        const currentGrafoMaterias = await getGrafoMateriasByGraphId(graphId);

        const grafoMateria = currentGrafoMaterias.find(
            (gm) => gm.id === grafoMateriaId
        );

        const prerequisite = currentGrafoMaterias.find(
            (gm) => gm.id === prerequisiteGrafoMateriaId
        );

        if (!grafoMateria || !prerequisite) return;

        if (grafoMateria.prerequisitesId.includes(prerequisiteGrafoMateriaId)) {
            alert("Ese prerrequisito ya fue agregado.");
            return;
        }

        // Si el prerrequisito ya depende de la materia actual, se crea un ciclo.
        if (
            grafoMateriaDependsOn(
                prerequisiteGrafoMateriaId,
                grafoMateriaId,
                currentGrafoMaterias
            )
        ) {
            alert("No se puede agregar porque se formaría un ciclo en el grafo.");
            return;
        }

        const ref = doc(db, "GrafoMaterias", grafoMateriaId);

        await updateDoc(ref, {
            prerequisitesId: [
                ...grafoMateria.prerequisitesId,
                prerequisiteGrafoMateriaId,
            ],
        });

        await getGrafoMateriasByGraphId(graphId);
    };

    // 🔹 Quitar prerrequisito
    const removePrerequisite = async (
        grafoMateriaId: string,
        prerequisiteGrafoMateriaId: string,
        graphId: string
    ) => {
        const grafoMateria = grafoMaterias.find(
            (gm) => gm.id === grafoMateriaId
        );

        if (!grafoMateria) return;

        const ref = doc(db, "GrafoMaterias", grafoMateriaId);

        await updateDoc(ref, {
            prerequisitesId: grafoMateria.prerequisitesId.filter(
                (id) => id !== prerequisiteGrafoMateriaId
            ),
        });

        await getGrafoMateriasByGraphId(graphId);
    };

    // 🔹 Busca los datos de una materia usando su materiaId
    const getMateriaInfo = (materiaId: string) => {
        return materias.find((m) => m.id === materiaId);
    };

    return {
        graph,
        materias,
        grafoMaterias,
        getGraphById,
        getGraphByPensumId,
        getOrCreateGraph,
        getMateriasByCarreraId,
        addMateriaToCarrera,
        editMateriaCarrera,
        deleteMateriaCarrera,
        materiaIsAssigned,
        getGrafoMateriasByGraphId,
        addMateriaToGraph,
        editGrafoMateria,
        deleteGrafoMateria,
        addPrerequisite,
        removePrerequisite,
        getMateriaInfo,
    };
}