'use client';
import { Key, useEffect, useState } from 'react';
import { useUser } from './UserContext'; // Importa el UserContext

const API_URL = 'https://contaminados.akamai.meseguercr.com/api';

interface GameData {
  id: string;
  name: string;
  status: string;
  players: string[];
  enemies: string[];
  currentRound: string;
  password: boolean;
  owner: string; // Agregamos el owner
}

interface RoundData {
  id: string;
  leader: string;
  status: string;
  group: string[]; // Grupo propuesto por el líder
}

export default function GameComponent({ gameId }: { gameId: string }) {
  const { username } = useUser(); // Obtener el nombre del usuario desde el contexto
  const [game, setGame] = useState<GameData | null>(null);
  const [round, setRound] = useState<RoundData | null>(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState(''); // Almacenar la contraseña si aplica
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]); // Jugadores seleccionados para el equipo
  const [canStart, setCanStart] = useState(false); // Verificar si se puede iniciar el juego
  const [actionSent, setActionSent] = useState(false); // Para controlar si el jugador ya envió su acción
  const [isEnemy, setIsEnemy] = useState(false); // Para controlar si el jugador es un enemigo
  const [isPlayerInGroup, setIsPlayerInGroup] = useState(false); // Para verificar si el jugador está en el grupo


  const MIN_PLAYERS = 5;
  const MAX_PLAYERS = 10;

  const submitAction = async (action: boolean) => {//Cuando es parte del equipo sabotea o colabora
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${round?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'player': username || '',
        },
        body: JSON.stringify({ action }), // Enviar true para colaborar, false para sabotear
      });

      if (response.ok) {
        setMessage('Acción registrada correctamente.');
        setActionSent(true); // Marcar que la acción fue enviada
      } else {
        setMessage('Error al enviar la acción.');
      }
    } catch (error) {
      console.error('Error al enviar la acción', error);
      setMessage('Error al enviar la acción.');
    }
  };



  // Función para que el líder proponga un equipo
  const proposeTeam = async () => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${round?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'player': username || '',
        },
        body: JSON.stringify({ group: selectedPlayers }),
      });

      if (response.ok) {
        setMessage('Equipo propuesto correctamente.');
        fetchRoundData(round?.id || ''); // Actualizamos los datos de la ronda
      } else {
        setMessage('Error al proponer el equipo.');
      }
    } catch (error) {
      console.error('Error al proponer el equipo', error);
      setMessage('Error al proponer el equipo.');
    }
  };

  // Fetch para obtener los datos del juego
  const fetchGameData = async () => {
    if (!username) {
      setMessage('No se ha encontrado el nombre de usuario.');
      return;
    }
    try {
      const headers: any = {
        'player': username, // Usamos el nombre del jugador desde el contexto
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
        // Si la lista de jugadores cambia, actualiza el estado
        if (!game || JSON.stringify(game.players) !== JSON.stringify(data.data.players)) {
          setGame({
            id: data.data.id,
            name: data.data.name,
            status: data.data.status,
            players: data.data.players,
            enemies: data.data.enemies,
            currentRound: data.data.currentRound,
            password: data.data.password,
            owner: data.data.owner,
          });
        }

        // Comprueba si el número de jugadores está dentro del rango permitido
        const numPlayers = data.data.players.length;
        setCanStart(numPlayers >= MIN_PLAYERS && numPlayers <= MAX_PLAYERS);

        // Solo hacer la solicitud de rounds si el juego está iniciado
        if (data.data.currentRound !== '0000000000000000000000000') {
          fetchRoundData(data.data.currentRound);
        }
      } else {
        setMessage(data.msg || 'Error al cargar los datos del juego.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del juego', error);
      setMessage('Error al cargar los datos del juego.');
    }
  };

  // Fetch para obtener los datos de la ronda
  const fetchRoundData = async (roundId: string) => {
    try {
      const headers: any = {
        'player': username, // Usamos el nombre del jugador desde el contexto
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

  // Función para que el owner inicie el juego con HEAD
  const startGame = async () => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/start`, {
        method: 'HEAD', // Cambiamos a HEAD
        headers: {
          'Content-Type': 'application/json',
          'player': username || '',
        },
      });

      if (response.ok) {
        setMessage('El juego ha comenzado.');
      } else {
        setMessage('Error al iniciar el juego.');
      }
    } catch (error) {
      console.error('Error al iniciar el juego', error);
      setMessage('Error al iniciar el juego.');
    }
  };

  // Función para votar a favor o en contra del grupo propuesto
  const voteForGroup = async (vote: boolean) => {
    try {

      console.log("Jugaodres seleccionados en voto:" + selectedPlayers + "y si este usuario es valido: " + isPlayerInGroup);

      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${round?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'player': username || '',
        },
        body: JSON.stringify({ vote }),
      });

      if (response.ok) {
        setMessage('Votaste correctamente.');
        fetchRoundData(round?.id || ''); // Actualizamos los datos de la ronda
      } else {
        setMessage('Error al votar por el equipo.');
      }
    } catch (error) {
      console.error('Error al votar por el equipo', error);
      setMessage('Error al votar por el equipo.');
    }
  };


  useEffect(() => {
    fetchGameData(); //primera solicitud de juego 

    // Intervalo para hacer la solicitud cada 5 segundos
    const intervalId = setInterval(fetchGameData, 5000);

    // Limpiamos el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
  }, [password, gameId]);

  useEffect(() => {
    if (game && game.currentRound && game.currentRound !== '0000000000000000000000000') {
      // Si la ronda actual es diferente a la almacenada, actualizar la ronda
      if (!round || round.id !== game.currentRound) {
        fetchRoundData(game.currentRound);
      }
    }

    // Verifica si los datos de la ronda y del jugador están cargados antes de ejecutar la verificación
    if (round && round.group && username) {
      // Registrar un log para depurar
      console.log(`Verificando si el jugador ${username} está en el grupo:`, round.group);

      const playerInGroup = round.group.includes(username);

      console.log(`Resultado de la verificación: ${playerInGroup}`);
      setIsPlayerInGroup(playerInGroup);
    }

    // Verificar si el jugador es enemigo solo si tenemos los datos del juego
    if (game && game.enemies && username) {
      setIsEnemy(game.enemies.includes(username));
    }
  }, [game, round, username]);





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

      {username && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Jugador actual</h2>
          <p>{username}</p>
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


          {round?.group.length > 0 && (
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Grupo Propuesto</h2>
              <ul className="list-none p-0">
                {round.group.map((player) => (
                  <li key={player} className="p-4 bg-gray-100 rounded mb-4 shadow">
                    {player}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-2xl font-bold">Jugadores ({game.players.length})</h2>
            <ul className="list-none p-0">
              {game.players.map((player) => (
                <li key={player} className="p-4 bg-gray-100 rounded mb-4 shadow">
                  <div className="font-bold text-lg" style={{ color: 'black' }}>
                    {player}
                  </div>

                  {/* Si el jugador actual es el líder, puede seleccionar jugadores */}
                  {round?.leader === username && (
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
          {round?.leader === username && selectedPlayers.length > 0 && (
            <button
              onClick={proposeTeam}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700 transition"
            >
              Proponer Equipo
            </button>
          )}

          {round?.group.length > 0 && (
            <div className="flex space-x-4">
              <button
                onClick={() => voteForGroup(true)}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition"
              >
                Votar a favor
              </button>
              <button
                onClick={() => voteForGroup(false)}
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-700 transition"
              >
                Votar en contra
              </button>
            </div>
          )}

          {isPlayerInGroup && round?.status == 'waiting-on-group' && (
            <>
              <button
                onClick={() => submitAction(true)} // Colaborar
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700 transition"
              >
                Colaborar
              </button>

              {isEnemy && (
                <button
                  onClick={() => submitAction(false)} // Sabotear
                  className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-700 transition"
                >
                  Sabotear
                </button>
              )}
            </>
          )}




          {round?.status === 'voting' && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold">Votaciones:</h2>
              {Array.isArray(round.votes) && round.votes.length > 0 ? (
                round.votes.map((vote: any, index: Key | null | undefined) => (
                  <span key={index}>{vote ? 'A favor' : 'En contra'}, </span>
                ))
              ) : (
                <p>No hay votos registrados aún.</p>
              )}
            </div>
          )}


          {/* Mostrar botón para iniciar el juego si el jugador actual es el owner y se puede iniciar el juego */}
          {game.owner === username && canStart && (
            <button
              onClick={startGame}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              Iniciar Juego
            </button>
          )}
        </>
      )}
    </div>
  );
}
