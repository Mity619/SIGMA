import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./Routes/AdminRoutes";
import NewsCreateRoute from "./Routes/NewsCreateRoute";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import Dashboard from "./Pages/Dashboard";
import DashboardAdmin from "./Pages/DashboardAdmin";
import ArbolAcademico from "./Pages/ArbolAcademico";
import CreateNews from "./Pages/CreateNews";
import Unauthorized from "./Pages/Unauthorized";
import Home from "./Pages/Home"


function App() {  
    return (  
        <Routes>
            <Route path="/" element={<Navigate to="/Dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/SignIn" replace />} />
            <Route path="/Matriculas" element={<Navigate to="/Dashboard" replace />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/register" element={<SignUp/>} />
            <Route path="/SignUp" element={<SignUp/>} />
            <Route path="/SignIn" element={<SignIn/>} />
            <Route path="/" element={<Home/>} />
            <Route path="/Dashboard" element={<Dashboard />} />

            <Route element={<AdminRoute/>}>
                <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
                <Route path="/Dashboard/ArbolAcademico" element={<ArbolAcademico />} />
            </Route>

            <Route element={<NewsCreateRoute />}>
                <Route path="/news/create" element={<CreateNews />} />
                <Route path="/Dashboard/Noticias" element={<CreateNews />} />
            </Route>

        </Routes>
    );
}

export default App;
