//import React from 'react';
import ReactDOM from 'react-dom/client';  // ✅ Importa correctamente
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from "./Context/AuthContext";
import { NewsContextProvider } from "./Context/NewsContext";
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <AuthContextProvider>
            <NewsContextProvider>
                <App />
            </NewsContextProvider>
        </AuthContextProvider>
    </BrowserRouter>
);
