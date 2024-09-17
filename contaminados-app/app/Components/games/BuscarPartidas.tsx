'use client';
import { useState, useEffect } from 'react';
import React from 'react';

const API_URL = 'https://contaminados.akamai.meseguercr.com/api';

interface BuscarPartidasProps {
    setGameId: React.Dispatch<React.SetStateAction<string | null>>;
}
interface Game {
    id: string;
    name: string;
    status: string;
    password: boolean; // Esta propiedad indica si la partida requiere contraseña o no
}

export default function BuscarPartidas({ setGameId }: { setGameId: (gameId: string) => void }) {
    const [games, setGames] = useState<Game[]>([]);
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState(''); // Controlar la contraseña ingresada
    const [playerName, setPlayerName] = useState<string | null>(null); // Nombre del jugador desde localStorage

    // Obtener el nombre del jugador desde localStorage cuando se carga el componente
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setPlayerName(storedUsername);
        } else {
            setMessage('No se encontró el nombre de usuario en localStorage.');
        }
    }, []);

    const searchGames = async () => {
        try {
            const response = await fetch(`${API_URL}/games`);
            const data = await response.json();

            setGames(data.data as Game[]);
            setMessage('Partidas cargadas correctamente.');
        } catch (error) {
            console.error('Error buscando partidas', error);
            setMessage('Error buscando partidas.');
        }
    };

    const joinGame = async (gameId: string, requiresPassword: boolean) => {
        if (!playerName) {
            setMessage('No se encontró el nombre del jugador.');
            return;
        }

        if (requiresPassword && !password) {
            setMessage('Esta partida requiere contraseña. Por favor, ingrese la contraseña.');
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
                    password: requiresPassword ? password : '', // Si no requiere contraseña, enviamos un string vacío
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Te has unido a la partida ${gameId}`);
                setGameId(data.data.id);
            } else {
                setMessage('Error al unirse a la partida.');
            }
        } catch (error) {
            console.error('Error uniéndote a la partida', error);
            setMessage('Error al intentar unirse a la partida.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Buscar Partidas</h2>

           
            <button
                onClick={searchGames}
                className="w-full bg-primary text-white p-2 rounded mb-4 hover:bg-accent transition"
            >
                Buscar Partidas
            </button>

            {message && <div className="p-4 bg-blue-100 text-blue-800 rounded mb-4">{message}</div>}

            {games.length > 0 && (
                <ul className="list-none p-0">
                    {games.map((game) => (
                        <li key={game.id} className="p-4 bg-gray-100 rounded mb-4 shadow">
                            <div className="font-bold text-lg" style={{ color: 'black' }}>
                                {game.name} - Estado: {game.status}
                            </div>

                            {/* mostrar campo de contraseña si la partida lo pide */}
                            {game.password && (
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-primary"
                                />
                            )}

                            <button
                                onClick={() => joinGame(game.id, game.password)}
                                className="bg-primary text-white p-2 rounded hover:bg-accent transition"
                            >
                                Unirse a esta partida
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
