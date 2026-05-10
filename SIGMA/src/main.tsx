import React from 'react';
import ReactDOM from 'react-dom/client';  // ✅ Importa correctamente
import { BrowserRouter } from 'react-router-dom';
import  {AuthContextProvider } from "./Context/AuthContext"
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
        <AuthContextProvider>
            <App />
        </AuthContextProvider>       
    </BrowserRouter>

);
