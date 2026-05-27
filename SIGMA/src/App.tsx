import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./Routes/AdminRoutes";
import EstudianteRoute from "./Routes/EstudianteRoutes";
import Home from "./Pages/Home";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import NewsPage from "./Pages/News";
import DashboardAdmin from "./Pages/DashboardAdmin";
import DashboardStudent from "./Pages/DashboardStudent";
import ArbolAcademico from "./Pages/ArbolAcademico";
import GrafoAcademico from "./Pages/GrafoAcademico";
import CreateNews from "./Pages/CreateNews";
import ManageNews from "./Pages/ManageNews";
import About from "./Pages/About";
import Historial from "./Pages/Historial";
import Matricula from "./Pages/Matricula";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/SignIn" element={<SignIn />} />
            <Route path="/About" element={<About/>} />
            <Route path="/News" element={<NewsPage />} />
            <Route path="/Matriculas" element={<Navigate to="/News" replace />} />

            <Route element={<AdminRoute />}>
                <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
                <Route path="/Dashboard/ArbolAcademico" element={<ArbolAcademico />} />
                <Route path="/Dashboard/GrafoAcademico/:pensumId" element={<GrafoAcademico />} />
                <Route path="/Dashboard/Noticias" element={<ManageNews />} />
                <Route path="/Dashboard/Noticias/crear" element={<CreateNews />} />
            </Route>
            <Route element={<EstudianteRoute/>}>
                <Route  path="/DashboardStudent" element={<DashboardStudent/>} />
                <Route path="/Dashboard/Historial" element={<Historial/>} />
                <Route path="/Dashboard/Matriculas" element={<Matricula/>} />
            </Route>
        </Routes>
    );
}

export default App;
