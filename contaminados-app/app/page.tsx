'use client'
import { useState } from 'react';
import React from 'react';

const API_URL = 'https://contaminados.akamai.meseguercr.com/api';

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState<string>('');
  const [gameName, setgameName] = useState<string>('');
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
          //password: password,
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
          'player': playerName, // Añadir el nombre del jugador en el header
          'password': password, // Añadir la contraseña en el header
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
    <div style={styles.container}>
      <h1 style={styles.title}>Acciones de Juego - contaminaDOS</h1>

      <div style={styles.box}>
        {/* Input para el nombre del jugador */}
        <input
          type="text"
          placeholder="Tu nombre"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={styles.input}
        />

        {/* Input para la contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Nombre de Partida"
          value={gameName}
          onChange={(e) => setgameName(e.target.value)}
          style={styles.input}
        />

        {/* Botón para buscar partidas */}
        <button onClick={searchGames} style={styles.button}>Buscar Partidas</button>

        {/* Botón para crear una nueva partida */}
        <button onClick={createGame} style={styles.button}>Crear Nueva Partida</button>
      </div>
      {/* Botón para iniciar */}
      <button onClick={startGame} style={styles.button}>
        Comenzar Juego
      </button>


      {/* Mostrar mensaje de feedback */}
      {message && <div style={styles.message}>{message}</div>}

      {/* Mostrar partidas encontradas */}
      {games.length > 0 && (
        <ul style={styles.list}>
          {games.map((game) => (
            <li key={game.id} style={styles.listItem}>
              <div>
                {game.name} - Estado: {game.status}
              </div>
              <div style={styles.buttonsContainer}>
                {/* Botón para unirse a la partida */}
                <button onClick={() => joinGame(game.id)} style={styles.button}>Unirse a esta partida</button>
                {/* Botón para ver rondas */}
                <button onClick={() => getRounds(game.id)} style={styles.button}>Ver Rondas</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Mostrar rondas de una partida */}
      {rounds.length > 0 && (
        <ul style={styles.list}>
          {rounds.map((round, index) => (
            <li key={index} style={styles.listItem}>
              Ronda {index + 1}: Líder: {round.leader}, Estado: {round.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Estilos en línea
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center' as 'center',
    color: '#333',
  },
  box: {
    backgroundColor: '#f4f4f4',
    padding: '20px',
    margin: '20px 0',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    textAlign: 'center' as 'center',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    padding: '10px 20px',
    margin: '10px 5px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
  },
  listItem: {
    backgroundColor: '#f9f9f9',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
  },
  buttonsContainer: {
    marginTop: '10px',
  },
  message: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#e7f3fe',
    border: '1px solid #b3d4fc',
    color: '#31708f',
    borderRadius: '5px',
    textAlign: 'center' as 'center',
  },
};
