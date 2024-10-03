'use client';
import { Key, useEffect, useState } from 'react';
import { useUser } from './UserContext';

const API_URL = 'https://contaminados.akamai.meseguercr.com/api';

interface GameData {
  id: string;
  name: string;
  status: string;
  players: string[];
  enemies: string[];
  currentRound: string;
  password: boolean;
  owner: string;
}

interface RoundData {
  id: string;
  leader: string;
  status: string;
  group: string[];
  result: string;
}

export default function GameComponent({ gameId }: { gameId: string }) {
  const { username, password, requiresPassword } = useUser(); // Obtener datos del contexto
  const [game, setGame] = useState<GameData | null>(null);
  const [round, setRound] = useState<RoundData | null>(null);
  const [message, setMessage] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]); // Jugadores seleccionados para el equipo
  const [canStart, setCanStart] = useState(false); // Verificar si se puede iniciar el juego
  const [actionSent, setActionSent] = useState(false); // Para controlar si el jugador ya envió su acción
  const [hasVoted, setHasVoted] = useState(false); // Para controlar si el jugador ya ha votado
  const [isEnemy, setIsEnemy] = useState(false); // Para controlar si el jugador es un enemigo
  const [isPlayerInGroup, setIsPlayerInGroup] = useState(false); // Para verificar si el jugador está en el grupo
  const [citizensWins, setCitizensWins] = useState(0); // Contador para los ciudadanos
  const [enemiesWins, setEnemiesWins] = useState(0); // Contador para los enemigos
  const [currentRoundNumber, setCurrentRoundNumber] = useState(0); // Número de la ronda actual
  const [teamProposed, setTeamProposed] = useState(false);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);



  const playerDistribution: Record<number, Record<number, number>> = {
    5: { 1: 2, 2: 3, 3: 2, 4: 3, 5: 3 },
    6: { 1: 2, 2: 3, 3: 3, 4: 4, 5: 4 },
    7: { 1: 2, 2: 3, 3: 3, 4: 4, 5: 5 },
    8: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
    9: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
    10: { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
  };



  const MIN_PLAYERS = 5;
  const MAX_PLAYERS = 10;

  const submitAction = async (action: boolean) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'player': username || '',
      };

      if (requiresPassword && password) {
        headers['password'] = password;
      }

      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${round?.id}`, {
        method: 'PUT',
        headers: headers,
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
      const headers: any = {
        'Content-Type': 'application/json',
        'player': username || '',
      };

      // Añadir la contraseña si la partida la requiere
      if (requiresPassword && password) {
        headers['password'] = password;
      }

      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${round?.id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ group: selectedPlayers }),
      });

      if (response.ok) {
        setMessage('Equipo propuesto correctamente.');
        setTeamProposed(true);
        fetchRoundData(round?.id || ''); // Actualizamos los datos de la ronda
      } else {
        setMessage('Error al proponer el equipo.');
      }
    } catch (error) {
      console.error('Error al proponer el equipo', error);
      setMessage('Error al proponer el equipo.');
    }
  };

  const getPlayersToPropose = () => {
    if (!game || !game.players.length) {
      return 'No disponible';
    }

    const numPlayers = game.players.length;

    // Obtener los valores de las rondas para la cantidad de jugadores actual No funciona
    if (playerDistribution[numPlayers]) {
      const rounds = Object.values(playerDistribution[numPlayers]);
      return `Debes seleccionar en las rondas: ${rounds.join(', ')}`;
    }

    return 'No disponible';
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

      if (requiresPassword && password) {
        headers['password'] = password;
      }

      const response = await fetch(`${API_URL}/games/${gameId}`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();

      if (data.status === 200) {
        setGame((prevGame) => {
          // Verificar si ha cambiado la lista de jugadores o el estado del juego
          if (
            !prevGame ||
            JSON.stringify(prevGame.players) !== JSON.stringify(data.data.players) ||
            prevGame.status !== data.data.status ||
            prevGame.currentRound !== data.data.currentRound
          ) {
            return {
              id: data.data.id,
              name: data.data.name,
              status: data.data.status,
              players: data.data.players,
              enemies: data.data.enemies,
              currentRound: data.data.currentRound,
              password: data.data.password,
              owner: data.data.owner,
              
            };


          }
          return prevGame; // Si no hay cambios, no se actualiza el estado
        });

        
          
        



        const numPlayers = data.data.players.length;
        setCanStart(numPlayers >= MIN_PLAYERS && numPlayers <= MAX_PLAYERS && data.data.status === "lobby");

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





  const fetchRoundData = async (roundId: string) => {
    try {
      const headers: any = {
        'player': username,
      };

      if (requiresPassword && password) {
        headers['password'] = password;
      }

      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${roundId}`, {
        method: 'GET',
        headers: headers,
      });

      const roundData = await response.json();

      if (roundData.status === 200) {
        // Verificar si el roundId ha cambiado, solo actualizar si es una nueva ronda
        if (roundData.data.id !== currentRoundId) {
          setRound(roundData.data);
          setCurrentRoundId(roundData.data.id); // Actualizamos el currentRoundId


          // Resetear votos y acciones si hay cambio de ronda
          setHasVoted(false);
          setActionSent(false);
        }

        // Actualizar las victorias de ciudadanos o enemigos
        if (roundData.data.result === 'citizens') {
          setWinnerMessage("Ganaron los ciudadanos");
        } else if (roundData.data.result === 'enemies') {
          setWinnerMessage("Ganaron los enemigos");
        }
      } else {
        setMessage(roundData.msg || 'Error al cargar los datos de la ronda.');
      }
    } catch (error) {
      console.error('Error al cargar los datos de la ronda', error);
      setMessage('Error al cargar los datos de la ronda.');
    }
  };



  const startGame = async () => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'player': username || '',
      };

      if (requiresPassword && password) {
        headers['password'] = password;
      }

      const response = await fetch(`${API_URL}/games/${gameId}/start`, {
        method: 'HEAD',
        headers: headers,
      });

      if (response.ok) {
        setMessage('El juego ha comenzado.');
        setGame((prevGame) => prevGame ? { ...prevGame, status: 'started' } : prevGame);
      } else {
        setMessage('Error al iniciar el juego.');
      }
    } catch (error) {
      console.error('Error al iniciar el juego', error);
      setMessage('Error al iniciar el juego.');
    }
  };





  const voteForGroup = async (vote: boolean) => {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'player': username || '',
      };

      if (requiresPassword && password) {
        headers['password'] = password;
      }

      const response = await fetch(`${API_URL}/games/${gameId}/rounds/${round?.id}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ vote }),
      });

      if (response.ok) {
        setMessage('Votaste correctamente.');
        setHasVoted(true); // Marcar que el jugador ya ha votado
        fetchRoundData(round?.id || ''); // Actualizamos los datos de la ronda
      } else {
        setMessage('Error al votar por el equipo.');
      }
    } catch (error) {
      console.error('Error al votar por el equipo', error);
      setMessage('Error al votar por el equipo.');
    }
  };



  const handlePlayerSelection = (player: string) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(player)) {
        return prev.filter((p) => p !== player); // Desmarcar si ya está seleccionado
      } else {
        return [...prev, player]; // Seleccionar jugador
      }
    });
  };

  useEffect(() => {
    fetchGameData(); // Cargar los datos del juego cuando el componente se monta

    // Intervalo para actualizar los datos del juego cada 5 segundos
    const intervalId = setInterval(() => {
      fetchGameData();
    }, 5000);

    // Limpiar el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
  }, [password, gameId, username]); // Dependencias de la contraseña, ID del juego y nombre de usuario


  useEffect(() => {
    if (game && game.currentRound && game.currentRound !== '0000000000000000000000000') {
      if (!round || round.id !== game.currentRound) {
        fetchRoundData(game.currentRound);
        setTeamProposed(false);
      }
    }

    if (round && round.group && username) {
      const playerInGroup = round.group.includes(username);
      setIsPlayerInGroup(playerInGroup);
    }

    if (game && game.enemies && username) {
      setIsEnemy(game.enemies.includes(username));
    }
  }, [game, round, username]);




  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Partida: {game?.name}</h1>


      {username && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Jugador actual</h2>
          <p>{username}</p>
        </div>
      )}
      {winnerMessage && (
        <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
          {winnerMessage}
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
            <p>{round?.leader || 'No se ha asignado líder aún'}</p>
          </div>

          {round?.group.length > 0 && (
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Grupo Propuesto</h2>
              <ul className="list-none p-0">
                {round.group.map((player) => (
                  <li key={player} className="p-4 bg-gray-100 rounded mb-4 shadow" style={{ color: 'black' }}>
                    {player}
                  </li>
                ))
                }
              </ul>
            </div>
          )}
          {message && <div className="p-4 bg-blue-100 text-blue-800 rounded mb-4">{message}</div>}

          <div className="mb-4">
            <h2 className="text-2xl font-bold">Jugadores ({game.players.length})</h2>
            <ul className="list-none p-0">
              {game.players.map((player) => (
                <li key={player} className="p-4 bg-gray-100 rounded mb-4 shadow">
                  <div className="font-bold text-lg" style={{ color: 'black' }}>
                    {player}
                  </div>

                  {round?.leader === username && (
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player)}
                        onChange={() => handlePlayerSelection(player)}
                      />
                      <span className="ml-2" style={{ color: 'black' }}>Seleccionar para el equipo</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>


          {round?.leader === username && !teamProposed && (

            <div className="mb-4">
              <h2 className="text-2xl font-bold">Jugadores a Proponer</h2>
              <p>{getPlayersToPropose() ? ` ${getPlayersToPropose()} ` : 'No disponible'}</p>
            </div>
          )}


          {round?.leader === username && selectedPlayers.length > 0 &&(
            <>

              <button
                onClick={proposeTeam}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700 transition"
              >
                Proponer Equipo
              </button>
            </>

          )}

          {round?.status === 'voting' && (
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


          {isPlayerInGroup && round?.status === 'waiting-on-group' && (
            <>
              <button
                onClick={() => submitAction(true)}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700 transition"
              >
                Colaborar
              </button>

              {isEnemy && (
                <button
                  onClick={() => submitAction(false)}
                  className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-700 transition"
                >
                  Sabotear
                </button>
              )}
            </>
          )}

          {game.owner === username && canStart && game.status === 'lobby' && (
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
