export type UserRole = 'Estudiante' | 'Admin';
export type EnrollmentStatus = 'Matriculado' | 'NoMatriculado' | 'NoAplica';

export interface User {
    id: string;        // Token de Firebase UID
    type: UserRole;
    enroll: EnrollmentStatus;
    name: string;
    history: string[];
    pensum: string | null;
    matricula: {
        materiaId: string;
        grupoNombre: string;
    }[];
}