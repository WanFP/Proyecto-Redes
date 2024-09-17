'use client';
import { useEffect, useState } from 'react';

const API_URL = 'https://contaminados.akamai.meseguercr.com/api';

interface GameData {
  id: string;
  name: string;
  status: string;
  players: string[];
  enemies: string[];
  currentRound: string;
  password: boolean;
}

interface RoundData {
  id: string;
  leader: string;
  status: string;
  group: string[]; // Grupo propuesto por el líder
}

export default function GameComponent({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<GameData | null>(null);
  const [round, setRound] = useState<RoundData | null>(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState(''); // Almacenar la contraseña si aplica
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]); // Jugadores seleccionados para el equipo
  const [canStart, setCanStart] = useState(false); // Verificar si se puede iniciar el juego

  const MIN_PLAYERS = 5;
  const MAX_PLAYERS = 10;

  // Recuperamos el nombre de usuario desde el localStorage
  const playerName = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  const fetchGameData = async () => {
    if (!playerName) {
      setMessage('No se ha encontrado el nombre de usuario en localStorage.');
      return;
    }

    try {
      const headers: any = {
        'player': playerName,
      };

      if (password) {
        headers['password'] = password;
      }

      const response = await fetch(`${API_URL}/games/${gameId}`, {
        method: 'GET',
        headers: headers,
      });
      const data = await response.json();

      if (data.status === 200) {
        setGame({
          id: data.data.id,
          name: data.data.name,
          status: data.data.status,
          players: data.data.players,
          enemies: data.data.enemies,
          currentRound: data.data.currentRound,
          password: data.data.password,
        });

        // Comprobar si el número de jugadores está dentro del rango permitido
        const numPlayers = data.data.players.length;
        setCanStart(numPlayers >= MIN_PLAYERS && numPlayers <= MAX_PLAYERS);

        // Obtener la información de la ronda actual
        fetchRoundData(data.data.currentRound);
      } else {
        setMessage(data.msg || 'Error al cargar los datos del juego.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del juego', error);
      setMessage('Error al cargar los datos del juego.');
    }
  };

  const fetchRoundData = async (roundId: string) => {
    try {
      const headers: any = {
        'player': playerName,
      };

      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${roundId}`, {
        method: 'GET',
        headers: headers,
      });
      const data = await response.json();

      if (data.status === 200) {
        setRound({
          id: data.data.id,
          leader: data.data.leader,
          status: data.data.status,
          group: data.data.group || [],
        });
      } else {
        setMessage(data.msg || 'Error al cargar los datos de la ronda.');
      }
    } catch (error) {
      console.error('Error al cargar los datos de la ronda', error);
      setMessage('Error al cargar los datos de la ronda.');
    }
  };

  // Función para que el líder proponga un equipo
  const proposeTeam = async () => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${round?.id}`, {
        method: 'PATCH', // Proponer un equipo
        headers: {
          'Content-Type': 'application/json',
          'player': playerName || '',
        },
        body: JSON.stringify({ group: selectedPlayers }),
      });

      if (response.ok) {
        setMessage('Equipo propuesto correctamente.');
      } else {
        setMessage('Error al proponer el equipo.');
      }
    } catch (error) {
      console.error('Error al proponer el equipo', error);
      setMessage('Error al proponer el equipo.');
    }
  };

  useEffect(() => {
    // Hacemos la primera solicitud cuando el componente se monta
    fetchGameData();

    // Intervalo para hacer la solicitud cada 5 segundos
    const intervalId = setInterval(fetchGameData, 5000);

    // Limpiamos el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
  }, [password, gameId]);

  const handlePlayerSelection = (player: string) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(player)) {
        return prev.filter((p) => p !== player); // Desmarcar si ya está seleccionado
      } else {
        return [...prev, player]; // Seleccionar jugador
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Partida: {game?.name}</h1>

      {message && <div className="p-4 bg-blue-100 text-blue-800 rounded mb-4">{message}</div>}

      {/* Mostrar el nombre del jugador actual */}
      {playerName && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Jugador actual</h2>
          <p>{playerName}</p>
        </div>
      )}

      {game?.password && !password && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Ingresa la contraseña del juego</h2>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-primary"
          />
        </div>
      )}

      {game && (
        <>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Estado del juego</h2>
            <p>{game.status}</p>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold">Líder de la ronda</h2>
            <p>{round?.leader || 'No se ha asignado líder aún'}</p> {/* Mostrar el líder */}
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold">Jugadores ({game.players.length})</h2>
            <ul className="list-none p-0">
              {game.players.map((player) => (
                <li key={player} className="p-4 bg-gray-100 rounded mb-4 shadow">
                  <div className="font-bold text-lg" style={{ color: 'black' }}>
                    {player}
                  </div>

                  {/* Si el jugador actual es el líder, puede seleccionar jugadores */}
                  {round?.leader === playerName && (
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player)}
                        onChange={() => handlePlayerSelection(player)}
                      />
                      <span className="ml-2">Seleccionar para el equipo</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Mostrar botón para proponer el equipo si el jugador actual es el líder */}
          {round?.leader === playerName && selectedPlayers.length > 0 && (
            <button
              onClick={proposeTeam}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700 transition"
            >
              Proponer Equipo
            </button>
          )}
        </>
      )}
    </div>
  );
}
