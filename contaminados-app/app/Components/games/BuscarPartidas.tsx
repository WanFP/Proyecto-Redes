'use client';
import { useState, useEffect } from 'react';
import { useUser } from './UserContext'; // Importar el hook para usar el contexto

const API_URL = 'https://contaminados.akamai.meseguercr.com/api';

interface BuscarPartidasProps {
    setGameId: React.Dispatch<React.SetStateAction<string | null>>;
}
interface Game {
    id: string;
    name: string;
    status: string;
    password: boolean;
}

export default function BuscarPartidas({ setGameId }: { setGameId: (gameId: string) => void }) {
    const { username, setPassword, password, setRequiresPassword } = useUser(); // Asegúrate de obtener los datos correctamente del contexto
    const [games, setGames] = useState<Game[]>([]);
    const [message, setMessage] = useState('');
    const [passwords, setPasswords] = useState<{ [key: string]: string }>({}); // Contraseñas por partida

    useEffect(() => {
        searchGames();
    }, []);

    const searchGames = async () => {
        try {
            const response = await fetch(`${API_URL}/games?page=4&limit=200`);
            const data = await response.json();
            setGames(data.data as Game[]);
            setMessage('Partidas cargadas correctamente.');
        } catch (error) {
            console.error('Error buscando partidas', error);
            setMessage('Error buscando partidas.');
        }
    };

    const handlePasswordChange = (gameId: string, value: string) => {
        setPasswords((prev) => ({ ...prev, [gameId]: value })); // Guardar la contraseña específica por partida
        setPassword(value); // Guardar la contraseña en el contexto
    };

    const joinGame = async (gameId: string, requiresPassword: boolean) => {
        const gamePassword = passwords[gameId] || ''; // Obtener la contraseña de la partida específica

        if (!username) {
            setMessage('No se encontró el nombre del jugador.');
            return;
        }

        if (requiresPassword && !gamePassword) {
            setMessage('Esta partida requiere contraseña. Por favor, ingrese la contraseña.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/games/${gameId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'player': username,
                    ...(requiresPassword && { 'password': gamePassword }) // Enviar la contraseña solo si es necesaria
                },
                body: JSON.stringify({
                    player: username,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Te has unido a la partida ${gameId}`);
                setGameId(data.data.id);
                setRequiresPassword(requiresPassword); // Guardar si la partida requiere contraseña en el contexto
            } else {
                setMessage(data.msg || 'Error al unirse a la partida.');
            }
        } catch (error) {
            console.error('Error uniéndote a la partida', error);
            setMessage('Error al intentar unirse a la partida.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Buscar Partidas</h2>

            {message && <div className="p-4 bg-blue-100 text-blue-800 rounded mb-4">{message}</div>}

            {games.length > 0 && (
                <ul className="list-none p-0">
                    {games.map((game) => (
                        <li key={game.id} className="p-4 bg-gray-100 rounded mb-4 shadow">
                            <div className="font-bold text-lg" style={{ color: 'black' }}>
                                {game.name} - Estado: {game.status}
                            </div>

                            {/* Mostrar campo de contraseña solo si la partida lo requiere */}
                            {game.password && (
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={passwords[game.id] || ''} // Mostrar la contraseña si ya fue ingresada
                                    onChange={(e) => handlePasswordChange(game.id, e.target.value)} // Actualizar la contraseña específica por partida
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
