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
    onSnapshot,
} from "firebase/firestore";
import type { User } from "../Utils/User";
import type { Materia, Grupo } from "../Utils/Graph";
import { enqueueSnackbar } from "notistack";

type MateriaCompleta = Materia & {
    semestre: number;
    prerequisites: string[];
};

export function useMatricula() {
    const [materias, setMaterias] = useState<MateriaCompleta[]>([]);
    const [loading,  setLoading]  = useState(false);

    const obtenerMateriasRealtime = async (pensumId: string) => {
        setLoading(true);

        try {
            // ── 1. Obtener graphId desde AcademicGraph ────────
            const graphSnap = await getDocs(
                query(collection(db, "AcademicGraph"), where("pensumId", "==", pensumId))
            );

            if (graphSnap.empty) {
                setMaterias([]);
                setLoading(false);
                return;
            }

            const graphId = graphSnap.docs[0].id;

            // ── 2. Obtener nodos del grafo (una vez, sin RT) ──
            //    Los nodos del grafo no cambian; solo cambian los
            //    cupos dentro de "Materias".
            const grafoSnap = await getDocs(
                query(collection(db, "GrafoMaterias"), where("graphId", "==", graphId))
            );

            if (grafoSnap.empty) {
                setMaterias([]);
                setLoading(false);
                return;
            }

            // Mapa materiaId → metadata del grafo
            const metaMap: Record<string, { semestre: number; prerequisites: string[] }> = {};
            const materiaIds: string[] = [];

            grafoSnap.docs.forEach(nodo => {
                const d = nodo.data();
                const mid = d.materiaId as string;
                metaMap[mid] = {
                    semestre:      d.semestre       ?? 0,
                    prerequisites: d.prerequisitesId ?? [],
                };
                materiaIds.push(mid);
            });

            // ── 3. Escuchar cambios en CADA documento Materias ─
            //    onSnapshot sobre cada doc individual para que
            //    cualquier cambio en grupos/cupos actualice la UI.
            const unsubscribers: (() => void)[] = [];

            // Estado local mutable para merge parcial
            const materiasMap: Record<string, MateriaCompleta> = {};

            const flush = () => {
                const lista = Object.values(materiasMap);
                lista.sort((a, b) => a.semestre - b.semestre);
                setMaterias([...lista]);
                setLoading(false);
            };

            let cargados = 0;

            materiaIds.forEach(mid => {
                const ref = doc(db, "Materias", mid);
                const unsub = onSnapshot(ref, snap => {
                    if (!snap.exists()) {
                        // Fallback si el doc no existe
                        materiasMap[mid] = {
                            id: mid, carreraId: "", nombre: mid,
                            codigo: "", creditos: 0, grupos: [],
                            semestre:      metaMap[mid].semestre,
                            prerequisites: metaMap[mid].prerequisites,
                        };
                    } else {
                        const d = snap.data();
                        materiasMap[mid] = {
                            id:            snap.id,
                            carreraId:     d.carreraId  ?? "",
                            nombre:        d.nombre     ?? "",
                            codigo:        d.codigo     ?? "",
                            creditos:      d.creditos   ?? 0,
                            grupos:        d.grupos     ?? [],   // ← cupos en tiempo real
                            semestre:      metaMap[mid].semestre,
                            prerequisites: metaMap[mid].prerequisites,
                        };
                    }
                    cargados++;
                    // Primera carga: esperar a tener todos
                    if (cargados >= materiaIds.length) flush();
                    // Actualizaciones posteriores: flush inmediato
                    else if (materiasMap[mid]) flush();
                });
                unsubscribers.push(unsub);
            });

            // Devuelve función que cancela TODOS los listeners
            return () => unsubscribers.forEach(u => u());

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
            // ── Validar requisitos ────────────────────────────
            // Si NO tiene prerequisites → puede matricular.
            // Si tiene prerequisites → TODOS deben estar en history.
            // CORRECCIÓN: prerequisites contiene IDs de materias
            // que el estudiante DEBE HABER CURSADO (estar en history).
            const history = user.history ?? [];

            const cumple = materia.prerequisites.length === 0
                || materia.prerequisites.every(id => history.includes(id));

            if (!cumple) {
                enqueueSnackbar("No cumples los requisitos para esta materia", { variant: "error" });
                return;
            }

            const materiaRef = doc(db, "Materias", materia.id);
            const userRef    = doc(db, "users", user.id);

            await runTransaction(db, async (tx) => {
                const snap = await tx.get(materiaRef);
                if (!snap.exists()) throw new Error("Materia no encontrada");

                const grupos: Grupo[] = snap.data().grupos ?? [];
                const index = grupos.findIndex(g => g.nombre === grupoNombre);

                if (index === -1) throw new Error("El grupo no existe");

                const grupo = grupos[index];

                // Validar cupos en transacción (evita race condition)
                const matriculados: string[] = grupo.matriculados ?? [];

                if (matriculados.length >= grupo.cupos)
                    throw new Error("Cupos agotados para este grupo");

                // Evitar doble matrícula en el mismo grupo
                if (matriculados.includes(user.id))
                    throw new Error("Ya estás matriculado en este grupo");

                // Evitar matrícula en otro grupo de la misma materia
                const yaEnOtroGrupo = grupos.some(
                    (g, i) => i !== index && (g.matriculados ?? []).includes(user.id)
                );
                if (yaEnOtroGrupo)
                    throw new Error("Ya estás matriculado en otro grupo de esta materia");

                // Añadir estudiante al grupo
                grupos[index] = {
                    ...grupo,
                    matriculados: [...matriculados, user.id],
                };

                tx.update(materiaRef, { grupos });
                tx.update(userRef, {
                    matricula: arrayUnion({ materiaId: materia.id, grupoNombre }),
                });
            });

            enqueueSnackbar("¡Matriculado correctamente!", { variant: "success" });

        } catch (e: any) {
            enqueueSnackbar(e.message ?? "Error al matricular", { variant: "error" });
        }
    };

    return { materias, loading, obtenerMateriasRealtime, matricularGrupo };
}