import { useEffect, useState } from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../Firebase/config';
import type { User } from '../Utils/types/User';
import type {User as FirebaseUser} from 'firebase/auth'

export const useFirebaseAuth = () => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Obtener datos adicionales del usuario desde Firestore
                const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data() as User);
                } else {
                    // Si no existe en Firestore, crear un usuario básico
                    const basicUser: User = {
                        id: firebaseUser.uid,
                        type: 'Estudiante', // valor por defecto
                        enroll: 'NoMatriculado',
                        email: firebaseUser.email || undefined
                    };
                    setUser(basicUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return { user, loading };
};