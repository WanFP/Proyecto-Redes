'use client'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();  
    


  // Función para obtener el valor de una cookie
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  // Función para establecer una cookie
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 86400000).toUTCString(); // Expira en `days` días
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    // Valida si el usuario o contraseña son vacíos
    if (!username || !password) {
      setError('Por favor, ingrese el usuario y la contraseña');
      return;
    }

    try {

               // Simulación del fetch comentada
      /*
      const response = await fetch('/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      // Simulación de la validación de la respuesta
      if (response.ok) {
        const token = data.token;
        const decodedToken = jwtDecode(token);
        const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

        if (decodedToken[roleKey] && decodedToken[roleKey] === 'Admin') {
          localStorage.setItem('username', username);  // Guardar el nombre de usuario
          setIsLoggedIn(true);  // Indicar que ha iniciado sesión correctamente
        } else {
          setError('Solo los administradores pueden acceder');
        }
      } else {
        setError('Nombre de usuario o contraseña incorrectos');
      }
      */
      // Simulación del inicio de sesión exitoso
      if (username === 'admin' && password === 'password') {  
        localStorage.setItem('username', username); // Guardar nombre de usuario en localStorage
        setCookie('sesion_iniciada', 'true', 7); // Crear cookie que dura 7 días
        setIsLoggedIn(true); // Marcar el inicio de sesión como exitoso
        navigate('/games'); // Redirige a la página de juegos
      } else {
        setError('Nombre de usuario o contraseña incorrectos');
      }
    } catch (error) {
      setError('Error al intentar iniciar sesión');
    }
  };

  useEffect(() => {
    // Verifica si la cookie "sesion_iniciada" ya existe
    const sesionCookie = getCookie('sesion_iniciada');
    const storedUsername = localStorage.getItem('username');
    
    if (sesionCookie && storedUsername) {
      setIsLoggedIn(true); // Si existe la cookie y el nombre de usuario, se marca como sesión iniciada
    }

    // Si está logueado, redirigir después de 1 segundo
    if (isLoggedIn) {
      setTimeout(() => {
        navigate('/games'); // Redirige a la página de juegos
      }, 1000);
    }
  }, [isLoggedIn, navigate]);

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          <h1>Iniciar Sesión</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Usuario:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Iniciar Sesión</button>
          </form>
        </div>
      ) : (
        <div>
          <h1>Bienvenido {localStorage.getItem('username')}</h1>
          <p>Redirigiendo...</p>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
