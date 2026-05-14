import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

export default function NewsCreateRoute() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("NewsCreateRoute debe usarse dentro de AuthContextProvider");
    }

    const { user } = context;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.type !== "Admin" && user.type !== "Profesor") {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
