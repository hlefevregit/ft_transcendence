"use strict";
// import { FastifyInstance } from 'fastify';
// import bcrypt from 'bcrypt';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRegisterRoute = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Charger l'image steve.jpg et la convertir en Base64
const stevePath = path_1.default.join(__dirname, '../assets/steve.jpg');
const steveBuffer = fs_1.default.readFileSync(stevePath);
const defaultAvatarBase64 = `data:image/jpeg;base64,${steveBuffer.toString('base64')}`;
const setupRegisterRoute = (fastify) => {
    fastify.post('/api/register', async (request, reply) => {
        const { name, email, password } = request.body;
        // Valider le pseudo : 1–16 caractères alphanum + _
        const nameRegex = /^[A-Za-z0-9_]{1,16}$/;
        if (!nameRegex.test(name.trim())) {
            return reply.status(400).send({
                message: 'Invalid username: 1 to 16 characters, letters, numbers, and underscore only.',
            });
        }
        // Valider l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return reply.status(400).send({ message: 'Invalid email address.' });
        }
        // Politique de mot de passe
        const pwdRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}/;
        if (!pwdRegex.test(password)) {
            return reply.status(400).send({
                message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
            });
        }
        // Vérifier si l'email est déjà pris
        const existingUser = await fastify.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return reply.status(400).send({ message: 'Email already registered' });
        }
        // Vérifier si le pseudo est déjà pris
        const existingPseudo = await fastify.prisma.user.findFirst({
            where: { pseudo: name.trim() },
        });
        if (existingPseudo) {
            return reply.status(400).send({ message: 'Pseudo already taken' });
        }
        // Création de l'utilisateur avec avatar par défaut en Base64
        const newUser = await fastify.prisma.user.create({
            data: {
                pseudo: name.trim(),
                email: email.trim(),
                password: await bcrypt_1.default.hash(password, 10),
                avatarUrl: defaultAvatarBase64,
                status: 'active',
                twoFAEnabled: false,
            },
        });
        const token = fastify.jwt.sign({
            id: newUser.id,
            email: newUser.email,
            pseudo: newUser.pseudo,
        });
        reply.send({ success: true, message: 'Registration successful', token });
        console.log('✅ User registered:', newUser);
    });
};
exports.setupRegisterRoute = setupRegisterRoute;
