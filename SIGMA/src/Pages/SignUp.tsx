import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useFirebaseAuth} from '../Hooks/useFirebaseAuth'
import type {UserRole, EnrollmentStatus} from '../Utils/User'
import "./SCSS/log.scss";

export default function SingUp() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [type, setType] = useState<UserRole>('Estudiante');
    const [name, setName] = useState("");
    const {register} = useFirebaseAuth();
    const handleSignUp = async () => {
        try{

            if(!name.trim() || !email.trim() || !password.trim()){

                alert("Todos los campos tienen que estar llenos")
                return;

            }

            if(password.length < 6){

                alert("A la contraseña tiene que al menos 7 caracteres")
                return;

            }

            let finalEnroll : EnrollmentStatus;
            if(type === "Admin"){

                finalEnroll = 'NoAplica';

            } else {

                finalEnroll = 'NoMatriculado';

            }

            const result = await register(email, password, type, name, finalEnroll);
            
            if (result.success) {

                alert("Registro exitoso. Ahora inicia sesión.");
                navigate("/login");

            } else {
                
                alert(result.error || "Error al registrarse");

            }
            } catch (error : unknown) {

                if(error instanceof Error){

                    alert(error.message)

                }
            }
    }
    return (

        <div className="login-container">
            <div className="login-card">
                <h2 style={{ color: 'black' }}>Register</h2>
                <input
                    type="name"
                    className="form-control"
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
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
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="btn btn-success"
                    onClick={handleSignUp}
                >
                    Register
                </button>
                <button
                    className="btn btn-link mt-2"
                    onClick={() => navigate("/login")}
                >
                ¿Ya tienes cuenta? Login
                </button>
            </div>
        </div>
    );
}