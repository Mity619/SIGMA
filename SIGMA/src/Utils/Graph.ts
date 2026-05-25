export interface Grupo {
    nombre: string;
    cupos: number;
}

// Materia general de una carrera.
export interface Materia {
    id: string;
    carreraId: string;
    nombre: string;
    codigo: string;
    creditos: number;
    grupos: Grupo[];
}

// Grafo asociado a un pensum específico.
export interface AcademicGraph {
    id: string;
    pensumId: string;
    carreraId: string;
    nombre: string;
}

// Materia asignada a un grafo: funciona como nodo dentro del grafo del pensum.
export interface GrafoMateria {
    id: string;
    graphId: string;
    materiaId: string;
    semestre: number;
    prerequisitesId: string[];
}