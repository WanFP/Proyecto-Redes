'use client'
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Search from './Components/games/page';
import Login from './Components/login/page';

export default function App() {
  return (
    <div style={{ width: 'auto', height: 'auto' }}>
      <main className="flex min-h-screen flex-col p-6">
        <Router>
          <Routes>
            {/* Ruta para la página de inicio de sesión */}
            <Route path='/' element={<Login />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
}
