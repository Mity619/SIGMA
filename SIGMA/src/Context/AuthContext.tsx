import { createContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from '../Utils/User';

interface AuthContextType {
    user: User | null;
    login:      (userData: User) => void;
    logout:     () => void;
    updateUser: (partial: Partial<User>) => void;  // ← nuevo
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
    children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    // Actualiza solo los campos que se pasen, mantiene el resto intacto
    const updateUser = (partial: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...partial } : null);
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;