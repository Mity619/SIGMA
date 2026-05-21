import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {
    const navigate = useNavigate();

    return(
        <div>
            <button
            onClick={() => navigate('/Dashboard/ArbolAcademico')}
           >
                Administración Academica
            </button>

            <button
            onClick={() => navigate('/Dashboard/Noticias')}
            >
                Administración de Noticias
            </button>
        </div>
    )
    
}