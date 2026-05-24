import { Routes, Route } from "react-router-dom";
import EstudianteRoute from "./Routes/EstudianteRoutes";
import AdminRoute from "./Routes/AdminRoutes";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import DashboardAdmin from "./Pages/DashboardAdmin";
import ArbolAcademico from "./Pages/ArbolAcademico";
import GrafoAcademico from "./Pages/GrafoAcademico";
import Home from "./Pages/Home"

function App() {  
    return (  
        <Routes>
            <Route path="/SignUp" element={<SignUp/>} />
            <Route path="/SignIn" element={<SignIn/>} />
            <Route path="/" element={<Home/>} />

            <Route element={<AdminRoute/>}>
                <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
                <Route path="/Dashboard/ArbolAcademico" element={<ArbolAcademico />} />
                <Route path="/Dashboard/GrafoAcademico/:grafoId" element={<GrafoAcademico />} />
            </Route>

        </Routes>
    );
}

export default App;
