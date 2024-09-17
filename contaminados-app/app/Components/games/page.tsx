'use client';
import { useState } from 'react';
import React from 'react';
import BuscarPartidas from './BuscarPartidas';
import CrearPartida from './CrearPartida';
import GameComponent from './GameComponent'; 

export default function Games() {
  const [gameId, setGameId] = useState<string | null>(null); // Estado para gestionar si el jugador está en un juego
  const [currentForm, setCurrentForm] = useState(''); // Estado para controlar el formulario a mostrar

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Acciones de Juego - contaminaDOS</h1>

      {gameId ? (
        
        <GameComponent gameId={gameId} /> 
      ) : (
        <>
         
          <div className="mb-4">
            <button
              onClick={() => setCurrentForm('search')}
              className="mr-4 bg-primary text-white p-2 rounded hover:bg-accent transition"
            >
              Buscar Partidas
            </button>
            <button
              onClick={() => setCurrentForm('create')}
              className="bg-primary text-white p-2 rounded hover:bg-accent transition"
            >
              Crear Nueva Partida
            </button>
          </div>

          {/* Mostrar el componente según el botón seleccionado */}
          {currentForm === 'search' && <BuscarPartidas setGameId={setGameId} />}
          {currentForm === 'create' && <CrearPartida setGameId={setGameId} />}
        </>
      )}
    </div>
  );
}
