import { FastifyInstance } from 'fastify';
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

  const existingPseudo = await fastify.prisma.user.findUnique({
      where: { pseudo: name },
  });
  if (existingPseudo) {
      return reply.status(400).send({ message: 'Pseudo already taken' });
  }

  const newUser = await fastify.prisma.user.create({
      data: {
          pseudo: name,
          email,
          password: await bcrypt.hash(password, 10), // Hash the password
          avatarUrl: 'https://i1.sndcdn.com/artworks-RK9z0md6Fh0mkDYz-KAfiQg-t500x500.jpg', // Default avatar URL
          status: 'Hello, I am using this app!', // Default status
      },
  });

  const token = fastify.jwt.sign({ 
    id: newUser.id, 
    email: newUser.email, 
    pseudo: newUser.pseudo, 
  });

    reply.send({ success: true, message: "Inscription réussie", token });
    console.log('✅ User registered:', newUser);
  });
};
