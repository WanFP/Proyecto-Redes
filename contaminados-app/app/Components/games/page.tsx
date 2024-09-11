'use client'
import { useState } from 'react';
import React from 'react';

const API_URL = 'https://contaminados.akamai.meseguercr.com/api';

export default function page() {
  const [games, setGames] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState<string>('');
  const [gameName, setGameName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null); // Estado para guardar el ID del juego

  
  const startGame = async () => {
    if (!currentGameId) {
      setMessage('No se ha unido a ninguna partida para iniciar.');
      return;
    }

    if (!playerName || !password) {
      setMessage('Por favor, ingrese su nombre y la contraseña para comenzar el juego.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/games/${currentGameId}/start`, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
          'player': playerName,
          'password': password,
        },
      });

      if (response.ok) {
        setMessage(`Juego ${currentGameId} ha comenzado.`);
      } else {
        const errorMsg = response.headers.get('X-msg') || 'Error al comenzar el juego.';
        setMessage(errorMsg);
      }
    } catch (error) {
      console.error('Error comenzando el juego', error);
      setMessage('Error al comenzar el juego.');
    }
  };

  // Solicitud GET para buscar partidas
  const searchGames = async () => {
    try {
      const response = await fetch(`${API_URL}/games`);
      const data = await response.json();
      setGames(data.data);
      setMessage('Partidas cargadas correctamente.');
    } catch (error) {
      console.error('Error buscando partidas', error);
      setMessage('Error buscando partidas.');
    }
  };

  // Solicitud POST para crear una nueva partida
  const createGame = async () => {
    if (!playerName) {
      setMessage('Por favor, ingrese su nombre');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: gameName,
          owner: playerName,
        }),
      });
      const data = await response.json();
      setMessage(`Partida creada con ID: ${data.data.id}`);
    } catch (error) {
      console.error('Error creando partida', error);
      setMessage('Error creando la partida.');
    }
  };

  // Solicitud PUT para unirse a una partida
  const joinGame = async (gameId: string) => {
    if (!playerName || !password) {
      setMessage('Por favor, ingrese su nombre y la contraseña para unirse.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/games/${gameId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: playerName,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Te has unido a la partida ${gameId}`);
        setCurrentGameId(data.data.id); // Guardar el ID del juego en el estado
      } else {
        setMessage('Error al unirse a la partida.');
      }
    } catch (error) {
      console.error('Error uniéndote a la partida', error);
      setMessage('Error al intentar unirse a la partida.');
    }
  };

  // Solicitud GET para obtener las rondas de un juego
  const getRounds = async (gameId: string) => {
    if (!playerName || !password) {
      setMessage('Por favor, ingrese su nombre y la contraseña para ver las rondas.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/games/${gameId}/rounds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'player': playerName,
          'password': password,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setRounds(data.data);
        setMessage(`Rondas cargadas para la partida ${gameId}`);
      } else {
        setMessage(`Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error cargando rondas', error);
      setMessage('Error al cargar las rondas.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Acciones de Juego - contaminaDOS</h1>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
        <input
          type="text"
          placeholder="Tu nombre"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="block w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-primary"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-primary"
        />

        <input
          type="text"
          placeholder="Nombre de Partida"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          className="block w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-primary"
        />

        <button
          onClick={searchGames}
          className="w-full bg-primary text-white p-2 rounded mb-4 hover:bg-accent transition"
        >
          Buscar Partidas
        </button>

        <button
          onClick={createGame}
          className="w-full bg-primary text-white p-2 rounded mb-4 hover:bg-accent transition"
        >
          Crear Nueva Partida
        </button>
      </div>

      <button
        onClick={startGame}
        className="w-full bg-primary text-white p-2 rounded mb-4 hover:bg-accent transition"
      >
        Comenzar Juego
      </button>

      {message && <div className="p-4 bg-blue-100 text-blue-800 rounded mb-4">{message}</div>}

      {games.length > 0 && (
        <ul className="list-none p-0">
          {games.map((game) => (
            <li key={game.id} className="p-4 bg-gray-100 rounded mb-4 shadow">
              <div className="font-bold text-lg">{game.name} - Estado: {game.status}</div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => joinGame(game.id)}
                  className="bg-primary text-white p-2 rounded hover:bg-accent transition"
                >
                  Unirse a esta partida
                </button>
                <button
                  onClick={() => getRounds(game.id)}
                  className="bg-primary text-white p-2 rounded hover:bg-accent transition"
                >
                  Ver Rondas
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rounds.length > 0 && (
        <ul className="list-none p-0">
          {rounds.map((round, index) => (
            <li key={index} className="p-4 bg-gray-100 rounded mb-4 shadow">
              Ronda {index + 1}: Líder: {round.leader}, Estado: {round.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
