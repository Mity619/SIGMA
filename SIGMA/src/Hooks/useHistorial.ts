import { useState } from "react";
import { db } from "../Firebase/config";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    getDoc,
    query,
    where,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";

export interface AcademicOpcion {
    id: string;
    name: string;
}

export interface Materia {
    id: string;
    name: string;
    credits: number;
    semestre: number;
    prerequisites: string[];
}

export function useHistorial() {
    const [facultades, setFacultades] = useState<AcademicOpcion[]>([]);
    const [carreras,   setCarreras]   = useState<AcademicOpcion[]>([]);
    const [pensums,    setPensums]    = useState<AcademicOpcion[]>([]);
    const [materias,   setMaterias]   = useState<Materia[]>([]);
    const [loading,    setLoading]    = useState(false);

    const obtenerFacultades = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "AcademicNode"), where("type", "==", "Facultad"));
            const snap = await getDocs(q);
            setFacultades(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const obtenerCarreras = async (facultadId: string) => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "AcademicNode"),
                where("type", "==", "Carrera"),
                where("parentId", "==", facultadId)
            );
            const snap = await getDocs(q);
            setCarreras(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const obtenerPensums = async (carreraId: string) => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "AcademicNode"),
                where("type", "==", "Pensum"),
                where("parentId", "==", carreraId)
            );
            const snap = await getDocs(q);
            setPensums(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const asignarPensum = async (pensumId: string, userId: string) => {
        const ref = doc(db, "users", userId);
        await updateDoc(ref, { pensum: pensumId });
    };

    const obtenerPensumActual = async (pensumId: string): Promise<string> => {
        try {
            setLoading(true);
            // getDoc directo por id es más eficiente que query
            const ref = doc(db, "AcademicNode", pensumId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return pensumId;
            return snap.data().name ?? pensumId;
        } catch (e) {
            console.error(e);
            return pensumId;
        } finally {
            setLoading(false);
        }
    };

    // Trae todas las materias del grafo asociado al pensumId
    // Paso 1: GrafoMaterias donde graphId == pensumId  → obtiene materiaId + semestre
    // Paso 2: consulta colección "Materias" por cada materiaId
    const obtenerMaterias = async (pensumId: string) => {
        try {
            setLoading(true);
        
            // ─────────────────────────────────────────────
            // 1. Buscar AcademicGraph asociado al pensum
            // ─────────────────────────────────────────────
            const qGraph = query(
                collection(db, "AcademicGraph"),
                where("pensumId", "==", pensumId)
            );
        
            const graphSnap = await getDocs(qGraph);
        
            if (graphSnap.empty) {
                console.warn("No existe AcademicGraph para este pensum");
                setMaterias([]);
                return [];
            }
        
            // Asumimos 1 graph por pensum
            const graphDoc = graphSnap.docs[0];
        
            // IMPORTANTE:
            // aquí puedes usar graphDoc.id
            // o graphDoc.data().graphId
            // dependiendo de cómo estructuraste la colección
        
            const graphId = graphDoc.id;
        
            console.log("Graph ID:", graphId);
        
            // ─────────────────────────────────────────────
            // 2. Buscar nodos del grafo
            // ─────────────────────────────────────────────
            const qMaterias = query(
                collection(db, "GrafoMaterias"),
                where("graphId", "==", graphId)
            );
        
            const snapMaterias = await getDocs(qMaterias);
        
            if (snapMaterias.empty) {
                console.warn("No hay materias asociadas al grafo");
                setMaterias([]);
                return [];
            }
        
            // ─────────────────────────────────────────────
            // 3. Obtener detalle de materias
            // ─────────────────────────────────────────────
            const lista: Materia[] = await Promise.all(
                snapMaterias.docs.map(async (nodo) => {
                
                    const dataNodo = nodo.data();
                
                    const materiaId = dataNodo.materiaId as string;
                
                    const semestre =
                        dataNodo.semestre ?? 0;
                
                    const prerequisites =
                        dataNodo.prerequisitesId ?? [];
                
                    // Buscar materia real
                    const materiaRef = doc(
                        db,
                        "Materias",
                        materiaId
                    );
                
                    const materiaSnap = await getDoc(materiaRef);
                
                    // fallback
                    if (!materiaSnap.exists()) {
                    
                        return {
                            id: materiaId,
                            name: materiaId,
                            credits: 0,
                            semestre,
                            prerequisites,
                        };
                    }
                
                    const materiaData = materiaSnap.data();
                
                    return {
                        id: materiaId,
                        name: materiaData.nombre ?? "",
                        credits: materiaData.creditos ?? 0,
                        semestre,
                        prerequisites,
                    };
                })
            );
        
            // ─────────────────────────────────────────────
            // 4. Ordenar materias
            // ─────────────────────────────────────────────
            lista.sort(
                (a, b) => a.semestre - b.semestre
            );
        
            setMaterias(lista);
        
            return lista;
        
        } catch (e) {
        
            console.error(e);
        
            return [];
        
        } finally {
        
            setLoading(false);
        }
    };

    // Añade una materia al historial del usuario
    const añadirMateria = async (materiaId: string, userId: string) => {
        const ref = doc(db, "users", userId);
        await updateDoc(ref, { history: arrayUnion(materiaId) });
    };

    // Elimina una materia del historial del usuario
    const eliminarMateria = async (materiaId: string, userId: string) => {
        const ref = doc(db, "users", userId);
        await updateDoc(ref, { history: arrayRemove(materiaId) });
    };

    return {
        facultades,
        carreras,
        pensums,
        materias,
        loading,
        obtenerFacultades,
        obtenerCarreras,
        obtenerPensums,
        asignarPensum,
        obtenerPensumActual,
        obtenerMaterias,
        añadirMateria,
        eliminarMateria,
    };
}