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

  const existingPseudo = await fastify.prisma.user.findFirst({
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
          twoFAEnabled: false, // Default to false, can be updated later
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






// import { FastifyInstance } from 'fastify';
// import bcrypt from 'bcrypt';
// import fs from 'fs';
// import path from 'path';

// // Charger l'image steve.jpg et la convertir en Base64
// const stevePath = path.join(__dirname, '../assets/steve.jpg');
// const steveBuffer = fs.readFileSync(stevePath);
// const defaultAvatarBase64 = `data:image/jpeg;base64,${steveBuffer.toString('base64')}`;

// export const setupRegisterRoute = (fastify: FastifyInstance) => {
//   fastify.post('/api/register', async (request, reply) => {
//     const { name, email, password } = request.body as {
//       name: string;
//       email: string;
//       password: string;
//     };

//     // Valider le pseudo : 1–16 caractères alphanum + _
//     const nameRegex = /^[A-Za-z0-9_]{1,16}$/;
//     if (!nameRegex.test(name.trim())) {
//       return reply.status(400).send({
//         message:
//           'Invalid username: 1 to 16 characters, letters, numbers, and underscore only.',
//       });
//     }

//     // Valider l'email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email.trim())) {
//       return reply.status(400).send({ message: 'Invalid email address.' });
//     }

//     // Politique de mot de passe
//     const pwdRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}/;
//     if (!pwdRegex.test(password)) {
//       return reply.status(400).send({
//         message:
//           'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
//       });
//     }

//     // Vérifier si l'email est déjà pris
//     const existingUser = await fastify.prisma.user.findUnique({
//       where: { email },
//     });
//     if (existingUser) {
//       return reply.status(400).send({ message: 'Email already registered' });
//     }

//     // Vérifier si le pseudo est déjà pris
//     const existingPseudo = await fastify.prisma.user.findFirst({
//       where: { pseudo: name.trim() },
//     });
//     if (existingPseudo) {
//       return reply.status(400).send({ message: 'Pseudo already taken' });
//     }

//     // Création de l'utilisateur avec avatar par défaut en Base64
//     const newUser = await fastify.prisma.user.create({
//       data: {
//         pseudo: name.trim(),
//         email: email.trim(),
//         password: await bcrypt.hash(password, 10),
//         avatarUrl: defaultAvatarBase64,
//         status: 'active',
//         twoFAEnabled: false,
//       },
//     });

//     const token = fastify.jwt.sign({
//       id: newUser.id,
//       email: newUser.email,
//       pseudo: newUser.pseudo,
//     });

//     reply.send({ success: true, message: 'Registration successful', token });
//     console.log('✅ User registered:', newUser);
//   });
// };
