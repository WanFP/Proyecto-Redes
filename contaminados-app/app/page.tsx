'use client';
import { useState } from 'react';
import BuscarPartidas from './Components/games/BuscarPartidas';
import CrearPartida from './Components/games/CrearPartida'; 
import GameComponent from './Components/games/GameComponent'; 
import LoginComponent from './Components/login/page';

export default function App() {
  const [step, setStep] = useState('login'); // Controla el paso del proceso
  const [gameId, setGameId] = useState<string | null>(null); // Almacena el ID de la partida creada o seleccionada
 

  // Manejador para iniciar sesión
  const handleLogin = (username: string) => {
    localStorage.setItem('username', username); 
    setStep('select'); 
  };

  // Seleccionar o crear una partida
  const handleGameSelection = (gameId: string) => {
    setGameId(gameId);
    setStep('game'); 
  };

  // Regresar al paso anterior
  const handleBack = () => {
    if (step === 'game') {
      setStep('select'); 
    } else if (step === 'search' || step === 'create') {
      setStep('select'); 
    } 
  };

  return (
    <div className="p-6">
      {/* Paso de Login */}
      {step === 'login' && (
        <LoginComponent onLogin={handleLogin} />
      )}

      {/* Paso de selección de partida (Buscar o Crear) */}
      {step === 'select' && (
        <div>
          <h1 className="text-3xl font-bold text-primary mb-6">Selecciona una opción</h1>
          <button
            onClick={() => setStep('search')}
            className="mr-4 bg-primary text-white p-2 rounded hover:bg-accent transition"
          >
            Buscar Partidas
          </button>
          <button
            onClick={() => setStep('create')}
            className="bg-primary text-white p-2 rounded hover:bg-accent transition"
          >
            Crear Partida
          </button>
        
        </div>
      )}

      {/* Paso para buscar partidas */}
      {step === 'search' && (
        <>
          <BuscarPartidas setGameId={handleGameSelection} />
          <button
            onClick={handleBack}
            className="mt-4 bg-secondary text-white p-2 rounded hover:bg-accent transition"
          >
            Regresar
          </button>
        </>
      )}

      {/* Paso para crear partidas */}
      {step === 'create' && (
        <>
          <CrearPartida setGameId={handleGameSelection} />
          <button
            onClick={handleBack}
            className="mt-4 bg-secondary text-white p-2 rounded hover:bg-accent transition"
          >
            Regresar
          </button>
        </>
      )}

      {/* Paso del juego */}
      {step === 'game' && gameId && (
        <>
          <GameComponent gameId={gameId} />
          <button
            onClick={handleBack}
            className="mt-4 bg-secondary text-white p-2 rounded hover:bg-accent transition"
          >
            Regresar a Selección de Partida
          </button>
        </>
      )}
    </div>
  );
}


