import { useEffect } from 'react';
import i18next from 'i18next'

export const useWebSocket = () => {
  useEffect(() => {
    const socket = new WebSocket('wss://localhost:3000/ws');

    socket.addEventListener('open', () => {
      console.log('Connexion WebSocket établie');
      socket.send(i18next.t('hello_world'));
    });

    socket.addEventListener('message', (event) => {
      console.log('Message reçu :', event.data);
    });

    return () => socket.close();
  }, []);
};
