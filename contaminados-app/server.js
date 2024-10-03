const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Configuración HTTPS
const httpsOptions = {
  key: fs.readFileSync('C:/Windows/System32/server.key'),  // Ajusta la ruta al archivo server.key
  cert: fs.readFileSync('C:/Windows/System32/server.cert'), // Ajusta la ruta al archivo server.cert
  // Opcional: Añade estos parámetros si el problema persiste (TLS versions, etc.)
  secureOptions: require('constants').SSL_OP_NO_SSLv2 | require('constants').SSL_OP_NO_SSLv3,
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-SHA256',
    'AES128-GCM-SHA256',
    'AES256-SHA256'
  ].join(':'),
  honorCipherOrder: true,
};

app.prepare().then(() => {
  const expressApp = express();

  // Manejar todas las rutas con Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  // Configuración del servidor HTTP
  const httpServer = http.createServer(expressApp);
  httpServer.listen(3000, () => {
    console.log('Servidor HTTP escuchando en el puerto 3000');
  });

  // Configuración del servidor HTTPS
  const httpsServer = https.createServer(httpsOptions, expressApp);
  httpsServer.listen(3443, () => {
    console.log('Servidor HTTPS escuchando en el puerto 3443');
  });

  // Manejo básico de errores del servidor HTTPS
  httpsServer.on('error', (err) => {
    console.error('Error en el servidor HTTPS:', err);
  });
});
