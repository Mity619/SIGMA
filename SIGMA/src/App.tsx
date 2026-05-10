import { Routes, Route } from "react-router-dom";
import EstudianteRoute from "./Routes/EstudianteRoutes";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn"

function App() {  
    return (  
        <Routes>
            <Route path="/SignUp" element={<SignUp/>} />
            <Route path="/SignIn" element={<SignIn/>} />
            <Route element={<EstudianteRoute/>} />
        </Routes>
    );
}

export default App;
