import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from '../Hooks/useFirebaseAuth';
import type { UserRole, EnrollmentStatus } from '../Utils/User';
import Navbar from "../Components/Navbar";
import "./SCSS/log.scss";

export default function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [type, setType] = useState<UserRole>('Estudiante');
    const { register } = useFirebaseAuth();

    const handleSignUp = async () => {
        try {
            if (!name.trim() || !email.trim() || !password.trim()) {
                alert("Todos los campos son obligatorios");
                return;
            }
            if (password.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres");
                return;
            }

            const finalEnroll: EnrollmentStatus =
                type === "Admin" ? 'NoAplica' : 'NoMatriculado';

            const result = await register(email, password, type, name, finalEnroll);

            if (result.success) {
                alert("Registro exitoso. Ahora inicia sesión.");
                navigate("/SignIn");
            } else {
                alert(result.error || "Error al registrarse");
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
                    <h1>Regístrate</h1>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="email"
                        className="form-control"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <select
                        className="form-control"
                        value={type}
                        onChange={(e) => setType(e.target.value as UserRole)}
                    >
                        <option value="Estudiante">Estudiante</option>
                        <option value="Admin">Administrador</option>
                    </select>

                    <input
                        type="password"
                        className="form-control"
                        placeholder="Contraseña (mín. 6 caracteres)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className="btn btn-success" onClick={handleSignUp}>
                        Crear Cuenta
                    </button>

                    <button
                        className="btn btn-link mt-2"
                        onClick={() => navigate("/SignIn")}
                    >
                        ¿Ya tienes cuenta? Inicia Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}