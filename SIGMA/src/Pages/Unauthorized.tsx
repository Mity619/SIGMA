import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <main>
            <h1>No autorizado</h1>
            <p>No tienes permisos para crear noticias.</p>
            <button type="button" onClick={() => navigate("/Dashboard")}>
                Volver al Dashboard
            </button>
        </main>
    );
}

