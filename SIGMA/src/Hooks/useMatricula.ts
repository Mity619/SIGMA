import { useState } from "react";
import { db } from "../Firebase/config";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    arrayUnion,
    runTransaction,
} from "firebase/firestore";
import type {User} from "../Utils/User";
import type {Materia, Grupo} from "../Utils/Graph";
import { onSnapshot } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
type MateriaCompleta = Materia & {
    semestre: number;
    prerequisites: string[];
};

export function useMatricula() {
    const [materias, setMaterias] = useState<MateriaCompleta[]>([]);
    const [loading, setLoading] = useState(false);

    const obtenerMateriasRealtime = async (
        pensumId: string
    ) => {
    
        setLoading(true);
    
        try {
        
            // ─────────────────────────────────────
            // 1. Buscar grafo del pensum
            // ─────────────────────────────────────
            const qGraph = query(
                collection(db, "AcademicGraph"),
                where("pensumId", "==", pensumId)
            );
        
            const graphSnap = await getDocs(qGraph);
        
            if (graphSnap.empty) {
            
                setMaterias([]);
                setLoading(false);
            
                return;
            }
        
            const graphId = graphSnap.docs[0].id;
        
            // ─────────────────────────────────────
            // 2. Escuchar GrafoMaterias
            // ─────────────────────────────────────
            const qGrafoMaterias = query(
                collection(db, "GrafoMaterias"),
                where("graphId", "==", graphId)
            );
        
            // Listener principal
            const unsubscribeGrafo = onSnapshot(
                qGrafoMaterias,
                async (snapshot) => {
                
                    try {
                    
                        // ─────────────────────────
                        // Metadata del grafo
                        // ─────────────────────────
                        const materiasBase =
                            snapshot.docs.map((nodo) => {
                            
                                const dataNodo = nodo.data();
                            
                                return {
                                    materiaId:
                                        dataNodo.materiaId as string,
                                
                                    semestre:
                                        dataNodo.semestre ?? 0,
                                
                                    prerequisites:
                                        dataNodo.prerequisitesId ?? [],
                                };
                            });
                        
                        // ─────────────────────────
                        // Obtener TODAS las materias
                        // ─────────────────────────
                        const lista: MateriaCompleta[] =
                            await Promise.all(
                            
                            materiasBase.map(
                                async (base) => {
                                
                                    const materiaRef = doc(
                                        db,
                                        "Materias",
                                        base.materiaId
                                    );
                                
                                    const materiaSnap =
                                        await getDoc(
                                            materiaRef
                                        );
                                    
                                    // Fallback
                                    if (!materiaSnap.exists()) {
                                    
                                        return {
                                            id: base.materiaId,
                                            carreraId: "",
                                            nombre: base.materiaId,
                                            codigo: "",
                                            creditos: 0,
                                            grupos: [],
                                            semestre: base.semestre,
                                            prerequisites:
                                                base.prerequisites,
                                        };
                                    }
                                
                                    const data =
                                        materiaSnap.data();
                                
                                    return {
                                    
                                        // Datos reales Materias
                                        id:
                                            materiaSnap.id,
                                    
                                        carreraId:
                                            data.carreraId ?? "",
                                    
                                        nombre:
                                            data.nombre ?? "",
                                    
                                        codigo:
                                            data.codigo ?? "",
                                    
                                        creditos:
                                            data.creditos ?? 0,
                                    
                                        grupos:
                                            data.grupos ?? [],
                                    
                                        // Datos del grafo
                                        semestre:
                                            base.semestre,
                                    
                                        prerequisites:
                                            base.prerequisites,
                                    };
                                }
                            ));
                        
                        // ─────────────────────────
                        // Ordenar
                        // ─────────────────────────
                        lista.sort(
                            (a, b) =>
                                a.semestre - b.semestre
                        );
                    
                        setMaterias(lista);
                    
                    } catch (e) {
                    
                        console.error(e);
                    }
                
                    setLoading(false);
                }
            );
        
            return unsubscribeGrafo;
        
        } catch (e) {
        
            console.error(e);
        
            setLoading(false);
        }
    };

    const matricularGrupo = async (
        materia: MateriaCompleta,
        grupoNombre: string,
        user: User
    ) => {
    
        try {
        
            // ─────────────────────────────
            // Validar requisitos
            // ─────────────────────────────
            const cumple =
                materia.prerequisites.every(
                    id => user.history.includes(id)
                );
            
            if (!cumple) {
            
                enqueueSnackbar(
                    "No cumples los requisitos",
                    { variant: "error" }
                );
            
                return;
            }
        
            const materiaRef = doc(
                db,
                "Materias",
                materia.id
            );
        
            await runTransaction(
                db,
                async (transaction) => {
                
                    const snap =
                        await transaction.get(
                            materiaRef
                        );
                    
                    if (!snap.exists()) {
                        throw new Error(
                            "Materia no encontrada"
                        );
                    }
                
                    const data = snap.data();
                
                    const grupos =
                        data.grupos ?? [];
                
                    const index =
                        grupos.findIndex(
                            (g: Grupo) =>
                                g.nombre === grupoNombre
                        );
                    
                    if (index === -1) {
                        throw new Error(
                            "Grupo no existe"
                        );
                    }
                
                    const grupo =
                        grupos[index];
                
                    // ───────────────────────
                    // Validar cupos
                    // ───────────────────────
                    if (
                        grupo.matriculados.length
                        >=
                        grupo.cupos
                    ) {
                    
                        throw new Error(
                            "Cupos agotados"
                        );
                    }
                
                    // Evitar duplicados
                    if (
                        grupo.matriculados.includes(
                            user.id
                        )
                    ) {
                    
                        throw new Error(
                            "Ya matriculado"
                        );
                    }
                
                    // ───────────────────────
                    // Añadir estudiante
                    // ───────────────────────
                    grupo.matriculados.push(
                        user.id
                    );
                
                    grupos[index] = grupo;
                
                    transaction.update(
                        materiaRef,
                        { grupos }
                    );
                
                    // ───────────────────────
                    // Actualizar usuario
                    // ───────────────────────
                    const userRef = doc(
                        db,
                        "users",
                        user.id
                    );
                
                    transaction.update(
                        userRef,
                        {
                            matricula: arrayUnion({
                                materiaId: materia.id,
                                grupoNombre,
                            })
                        }
                    );
                }
            );
        
            enqueueSnackbar(
                "Matriculado correctamente",
                { variant: "success" }
            );
        
        } catch (e: any) {
        
            enqueueSnackbar(
                e.message,
                { variant: "error" }
            );
        }
    };

    return {
        materias,
        loading,
        obtenerMateriasRealtime,
        matricularGrupo,
    }
    
}