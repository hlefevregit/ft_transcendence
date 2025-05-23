import { FastifyInstance } from 'fastify';
import { dbPromise } from '../db/database';
import bcrypt from 'bcrypt';
import fastifyWebsocket from '@fastify/websocket';
import { GOOGLE_CLIENT_ID } from '../config/env';

export const setupAuthRoutes = (fastify: FastifyInstance) => {
	fastify.get('/api/pong', { websocket: true }, (connection: fastifyWebsocket.SocketStream, req) => {
		// Handle connection
		console.log('Client connected');
		connection.socket.send('ping');
		connection.socket.on('message', (message) => {
			// Handle incoming messages
			console.log('Received:', message.toString());

			// Respond back to the client
			connection.socket.send('pong');
		});
	});
};
