// Utils/types/User.ts
export type UserRole = 'Estudiante' | 'Admin' | 'Profesor';
export type EnrollmentStatus = 'Matriculado' | 'NoMatriculado' | 'NoAplica';

export interface User {
    id: string;        // Token de Firebase UID
    type: UserRole;
    enroll: EnrollmentStatus;
    name: string;
}