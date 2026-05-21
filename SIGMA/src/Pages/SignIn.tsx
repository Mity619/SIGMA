import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext  from "../Context/AuthContext";
import {useFirebaseAuth} from '../Hooks/useFirebaseAuth'
import "./SCSS/log.scss";

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login: firebaseLogin } = useFirebaseAuth();   // login del hook
    const { login: contextLogin } = useContext(AuthContext)!; // login del contexto

    const handleLogin = async () => {
        try {
            const result = await firebaseLogin(email, password);
            if (result.success && result.user) {
                contextLogin(result.user);
                console.log(result.user.type);
                if (result.user.type==='Admin'){
                    navigate("/DashboardAdmin");
                }   
                
            } else {
                alert(result.error || "Error al iniciar sesión");
            }
        } catch (error: unknown) {

            if (error instanceof Error) {
                alert(error.message);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 style={{ color: 'black' }}>Inicia Sesion</h1>
                <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="btn btn-primary"
                    onClick={handleLogin}
                >
                Login
                </button>
                <button
                    className="btn btn-link mt-2"
                    onClick={() => navigate("/register")}
                >
                ¿No tienes cuenta? Regístrate
                </button>
            </div>
        </div>
    );
}