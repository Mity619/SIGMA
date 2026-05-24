import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";
import { useFirebaseAuth } from '../Hooks/useFirebaseAuth';
import Navbar from "../Components/Navbar";
import "./SCSS/log.scss";
import { useSnackbar } from 'notistack';

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login: firebaseLogin } = useFirebaseAuth();
    const { login: contextLogin } = useContext(AuthContext)!;
    const { enqueueSnackbar } = useSnackbar();

    const handleLogin = async () => {
        try {
            const result = await firebaseLogin(email, password);
            if (result.success && result.user) {
                contextLogin(result.user);
                if (result.user.type === 'Admin') {
                    enqueueSnackbar('Inicio Sesión Exitoso',{variant:'success'});
                    navigate("/DashboardAdmin");
                }
            } else {
                enqueueSnackbar('Error al Iniciar Sesión',{variant:'error'});
            }
        } catch (error: unknown) {
            if (error instanceof Error) alert(error.message);
        }
    };

    return (
        <div className="auth-page">
            <Navbar />
            <div className="login-container">
                <div className="login-card">
                    <h1>Inicia Sesión</h1>

                    <input
                        type="email"
                        className="form-control"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        className="form-control"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className="btn btn-primary" onClick={handleLogin}>
                        Iniciar Sesión
                    </button>

                    <button
                        className="btn btn-link mt-2"
                        onClick={() => navigate("/SignUp")}
                    >
                        ¿No tienes cuenta? Regístrate
                    </button>
                </div>
            </div>
        </div>
    );
}
