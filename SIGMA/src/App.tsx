import { Routes, Route, Navigate } from "react-router-dom";
import EstudianteRoute from "./Routes/EstudianteRoutes";
import AdminRoute from "./Routes/AdminRoutes";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import DashboardAdmin from "./Pages/DashboardAdmin";
import ArbolAcademico from "./Pages/ArbolAcademico";
import Home from "./Pages/Home"


function App() {  
    return (  
        <Routes>
            <Route path="/" element={<Navigate to="/Dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/SignIn" replace />} />
            <Route path="/Matriculas" element={<Navigate to="/Matriculas" replace />} />
            <Route path="/unauthorized" element={<Navigate to="/unauthorized" replace />} />
            //rebundante, pero por si acaso
            <Route path="/register" element={<SignUp/>} />
            <Route path="/SignUp" element={<SignUp/>} />
            //
            <Route path="/SignIn" element={<SignIn/>} />
            <Route path="/" element={<Home/>} />

            <Route element={<AdminRoute/>}>
                <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
                <Route path="/Dashboard/ArbolAcademico" element={<ArbolAcademico />} />
            </Route>

        </Routes>
    );
}

export default App;
