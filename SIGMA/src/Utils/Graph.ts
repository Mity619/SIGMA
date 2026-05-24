export interface Grupo {
    nombre: string;
    cupos: number;
}

export interface Materia {
    id: string;
    graphId: string;
    nombre: string;
    codigo: string;
    creditos: number;
    semestre: number;
    grupos: Grupo[];
    prerequisitesId: string[];
}

export interface AcademicGraph {
    id: string;
    pensumId: string;
    nombre: string;
}