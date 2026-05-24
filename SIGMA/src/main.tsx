import React from 'react';
import ReactDOM from 'react-dom/client';  // ✅ Importa correctamente
import { BrowserRouter } from 'react-router-dom';
import  {AuthContextProvider } from "./Context/AuthContext"
import App from './App';
import './index.css';
import { SnackbarProvider } from 'notistack';

ReactDOM.createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
        <AuthContextProvider>
            <SnackbarProvider maxSnack={3}>
                <App />
            </SnackbarProvider>
        </AuthContextProvider>       
    </BrowserRouter>

);
