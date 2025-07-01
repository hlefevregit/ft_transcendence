export const createWebSocket = () => {
	const socket = new WebSocket('wss://localhost:3000/ws');
  
	socket.addEventListener('open', () => {
		// console.log('Connexion WebSocket établie');
		socket.send('Hello serveur!');
	});
  
	socket.addEventListener('message', (event) => {
		// console.log('Message du serveur:', event.data);
	});
  
	return socket;
};