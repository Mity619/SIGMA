import { useContext } from "react";
import AuthContext from "../Context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error("UserRoute debe usarse dentro de AuthContextProvider");
    }
    
    const { user } = context;
    
    // Verificar que existe usuario Y que es Estudiante
    if (!user) {
        return <Navigate to="/SignIn" />;
    }
    
    // Verificar el tipo de usuario
    if (user.type !== "Admin") {
        // Redirección por defecto
        return <Navigate to="/unauthorized" />;
    }
    
    // Mostrar las rutas hijas
    return <Outlet />;
}