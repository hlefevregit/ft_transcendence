import { FastifyInstance } from 'fastify';
import { dbPromise } from '../db/database';
import bcrypt from 'bcrypt';

export const setupRegisterRoute = (fastify: FastifyInstance) => {
  fastify.post('/api/register', async (request, reply) => {
    const { name, email, password } = request.body as { name: string; email: string; password: string };
    
  const existingUser = await fastify.prisma.user.findUnique({
      where: { email },
  });

  if (existingUser) {
      return reply.status(400).send({ message: 'Email already registered' });
  }

  const newUser = await fastify.prisma.user.create({
      data: {
          pseudo: name,
          email,
          password: await bcrypt.hash(password, 10), // Hash the password
          avatarUrl: 'https://example.com/default-avatar.png', // Default avatar URL
          status: 'Hello, I am using this app!', // Default status
      },
  });

  const token = fastify.jwt.sign({ 
    id: newUser.id, 
    email: newUser.email, 
    pseudo: newUser.pseudo, 
    avatarUrl: newUser.avatarUrl, 
    status: newUser.status 
  });

    reply.send({ success: true, message: "Inscription réussie", token });
    console.log('✅ User registered:', newUser);
    console.log('✅ Token generated:', token);
  });
};
