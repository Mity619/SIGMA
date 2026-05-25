// hooks/useFirebaseAuth.ts
import { useState, useEffect } from "react";
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from "firebase/auth";
import { auth, db } from "../Firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User, UserRole, EnrollmentStatus } from "../Utils/User";

export const useFirebaseAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Función auxiliar para obtener el usuario desde Firestore (colección "users")
    const fetchUserFromFirestore = async (uid: string): Promise<User | null> => {
        try {
            const userDocRef = doc(db, "users", uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Aseguramos que tenga la estructura exacta de User
                const userData: User = {
                    id: docSnap.id,          // el UID
                    type: data.type,
                    enroll: data.enroll,
                    name: data.name,
                    history: data.history || [], // si no existe, array vacío
                };
                return userData;
            }
            return null;
        } catch (error) {
            console.error("Error al obtener perfil:", error);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userProfile = await fetchUserFromFirestore(firebaseUser.uid);
                setUser(userProfile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            const uid = res.user.uid;
            const userProfile = await fetchUserFromFirestore(uid);
            if (!userProfile) {
                await logout(); // Limpiamos el estado
                return { success: false, error: "Perfil de usuario no encontrado en la base de datos" };
            }
            setUser(userProfile);
            return { success: true, user: userProfile };
        } catch (error) {
            console.error("Error en login:", error);
            return { success: false, error };
        }
    };

    const register = async (
        email: string,
        password: string,
        type: UserRole,
        name: string,
        enroll: EnrollmentStatus
    ) => {
      try {
          // 1. Crear usuario en Firebase Auth
          const res = await createUserWithEmailAndPassword(auth, email, password);
          const uid = res.user.uid;

          // 2. Crear documento en Firestore con la estructura exacta de User
          const newUser: Omit<User, 'id'> = {
              type,
              enroll,
              name,
              history: [],
          };
          await setDoc(doc(db, "users", uid), newUser);

          // 3. Obtener el usuario completo (con id incluido)
          const userProfile: User = { id: uid, ...newUser };
          setUser(userProfile);
          return { success: true, user: userProfile };
      } catch (error) {
          console.error("Error en registro:", error);
          return { success: false, error };
      }
    };

    const logout = async () => {
      try {
          await signOut(auth);
          setUser(null);
          return { success: true };
      } catch (error) {
          console.error("Error al cerrar sesión:", error);
          return { success: false, error };
      }
    };

    return { user, loading, login, register, logout };
};