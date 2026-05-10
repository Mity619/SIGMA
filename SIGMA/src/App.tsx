import { Routes, Route } from "react-router-dom";
import EstudianteRoute from "./Routes/EstudianteRoutes";
import SingUp from "./Pages/SignUp";

function App() {  
    return (  
        <Routes>
            <Route path="/SignUp" element={<SingUp/>} />
            <Route element={<EstudianteRoute/>} />
        </Routes>
    );
}

export default App;
