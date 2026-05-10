import { useContext, useState } from "react";
import AuthContext from '../Context/AuthContext'
import { useNavigate } from "react-router-dom";

export default function SingUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [type, setType] = useState("");

    const handleSignUp = async () => {
        try{
            

            navigate("/login");
        } catch (error : unknown) {
            if(error instanceof Error){
                alert(error.message)
            }
            
        }
    }
}