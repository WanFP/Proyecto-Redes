import { useState } from 'react';
import React from 'react';
import { useUser } from './UserContext'; // Asegúrate de tener el contexto importado correctamente

const API_URL = 'https://contaminados.akamai.meseguercr.com/api';

export default function CrearPartida({ setGameId }: { setGameId: (gameId: string) => void }) {
    const { username, setPassword, setRequiresPassword } = useUser(); // Obtener y actualizar datos del contexto
    const [gameName, setGameName] = useState('');
    const [localPassword, setLocalPassword] = useState(''); // Contraseña local
    const [usePassword, setUsePassword] = useState(false); // Estado para controlar el uso de la contraseña
    const [message, setMessage] = useState('');

    const createGame = async () => {
        console.log('Username:', username); // Para depuración
        if (!username || !gameName) {
            setMessage('Por favor, ingrese su nombre y el nombre de la partida');
            console.log(username);
            return;
        }

        const gameData: any = {
            name: gameName,
            owner: username, // Usamos el nombre del usuario desde el contexto
        };

        // Si la opción de usar contraseña está activa, añadirla a los datos
        if (usePassword && localPassword) {
            gameData.password = localPassword;
        }

        try {
            const response = await fetch(`${API_URL}/games`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Partida creada con éxito. ID: ${data.data.id}`);
                setGameId(data.data.id);

                // Guardar la información de la contraseña y si es requerida en el contexto
                setRequiresPassword(usePassword); // Guardar si la partida requiere contraseña
                if (usePassword) {
                    setPassword(localPassword); // Guardar la contraseña en el contexto si es necesaria
                }
            } else {
                setMessage(`Error al crear la partida: ${data.msg || 'Desconocido'}`);
            }
        } catch (error) {
            console.error('Error creando partida', error);
            setMessage('Error creando la partida.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Crear Nueva Partida</h2>

            <input
                type="text"
                placeholder="Nombre de Partida"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="block w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-primary"
            />

            {/* Checkbox para definir si se usará contraseña o no */}
            <div className="mb-4">
                <label>
                    <input
                        type="checkbox"
                        checked={usePassword}
                        onChange={(e) => setUsePassword(e.target.checked)}
                    />
                    {' '}¿Usar Contraseña?
                </label>
            </div>

            {/* Campo de contraseña solo si el checkbox está activo */}
            {usePassword && (
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={localPassword}
                    onChange={(e) => setLocalPassword(e.target.value)}
                    className="block w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-primary"
                />
            )}

            <button
                onClick={createGame}
                className="w-full bg-primary text-white p-2 rounded mb-4 hover:bg-accent transition"
            >
                Crear Partida
            </button>

            {message && <div className="p-4 bg-blue-100 text-blue-800 rounded mb-4">{message}</div>}
        </div>
    );
}
