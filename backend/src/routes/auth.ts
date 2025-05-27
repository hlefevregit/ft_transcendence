import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config/env';

export const setupAuthRoutes = (fastify: FastifyInstance) => {
	fastify.post('/api/auth/google', async (request, reply) => {
		const { id_token } = request.body as { id_token: string };
		if (!id_token) return reply.status(400).send({ success: false, message: "Token manquant" });

		const client = new OAuth2Client(GOOGLE_CLIENT_ID);
		const ticket = await client.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
		const payload = ticket.getPayload();
		if (!payload || !payload.email) return reply.status(400).send({ success: false, message: "Informations introuvables" });

		const { email, name } = payload;
		const existingUser = await fastify.prisma.user.findUnique({
					where: { email },
		});
		
		if (existingUser) {
			return reply.send({ success: true, token: fastify.jwt.sign({
				id: existingUser.id,
				email: existingUser.email,
				pseudo: existingUser.pseudo,
				avatarUrl: existingUser.avatarUrl,
				status: existingUser.status,
			}) });
		}
		
		const newUser = await fastify.prisma.user.create({
			data: {
				email,
				pseudo: name,
				avatarUrl: "https://i1.sndcdn.com/artworks-RK9z0md6Fh0mkDYz-KAfiQg-t500x500.jpg", // Default avatar URL
				status: 'Hello, I am using this app!', 
				twoFAEnabled: false, // Default to false, can be updated later
			},
		});
		

		const token = fastify.jwt.sign({
			id: newUser.id,
			email: newUser.email,
			pseudo: newUser.pseudo,
			avatarUrl: newUser.avatarUrl,
			status: newUser.status
		});
		reply.send({ success: true, token });
	});

	fastify.post('/api/auth/sign_in', async (request, reply) => {
		const { email, password } = request.body as { email: string; password: string };

		const user = await fastify.prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return reply.status(401).send({ success: false, message: "Utilisateur non trouvé" });
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return reply.status(401).send({ success: false, message: "Mot de passe invalide" });
		}

		const token = fastify.jwt.sign({
			id: user.id,
			email: user.email,
			pseudo: user.pseudo,
			twoFAEnabled: user.twoFAEnabled,
		});

		reply.send({
			success: true,
			token,
			user: {
				id: user.id,
				email: user.email,
				twoFAEnabled: user.twoFAEnabled,
			}
		});
	});


};
