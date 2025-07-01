import { useEffect } from 'react';

export const useWebSocket = () => {
  useEffect(() => {
    const socket = new WebSocket('wss://localhost:3000/ws');

    socket.addEventListener('open', () => {
      // console.log('Connexion WebSocket établie');
      socket.send('Hello serveur!');
    });

    socket.addEventListener('message', (event) => {
      // console.log('Message reçu :', event.data);
    });

    return () => socket.close();
  }, []);
};
