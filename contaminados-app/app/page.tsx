'use client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Games from './Components/games/page'; 
import Login from './Components/login/page';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Games />} />
        <Route path="/games" element={<Login />} /> {/* Ruta para la página de juegos */}
      </Routes>
    </Router>
  );
}

export default App;
