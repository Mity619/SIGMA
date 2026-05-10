import { useContext, useState } from "react";
import AuthContext from '../Context/AuthContext'
import { useNavigate } from "react-router-dom";
import "./SCSS/log.scss";

export default function SingUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [type, setType] = useState("");
    const [enroll, setEnroll] = useState("");
    const [name, setName] = useState("");


    const handleSignUp = async () => {
        try{
            

            navigate("/login");
        } catch (error : unknown) {
            if(error instanceof Error){
                alert(error.message)
            }
            
        }
    }

    return (
    
    <div className="login-container">
      <div className="login-card">
        <h2>Register</h2>

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