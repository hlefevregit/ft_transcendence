// src/server.ts
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import fs from 'fs';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

process.on('uncaughtException', (err) => {
	console.error('🛑 Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('🛑 Unhandled Rejection:', reason);
});
  

const fastify = Fastify({
	logger: true,
	https: {
	  key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
	  cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
	}
});

// Configuration CORS pour autoriser ton frontend
fastify.register(fastifyCors, {
	origin: ["https://localhost:8080", "https://localhost:5173"],
	methods: ['GET', 'POST', 'PUT', 'DELETE']
});


fastify.get('/api/ping', async (request, reply) => {
	console.log("🔥 Route /api/ping appelée");
	reply.send({ success: true, message: "pong" });
});
  

// Plugin JWT avec une clé secrète
fastify.register(fastifyJwt, {
	secret: process.env.JWT_SECRET || 'fallback_secret'
});

// Plugin WebSocket (pour la partie multijoueur, si nécessaire)
fastify.register(fastifyWebsocket);

// Servir les fichiers statiques (ton frontend) depuis le dossier "public"
const staticDir = path.join(process.cwd(), 'public');

if (fs.existsSync(staticDir)) {
  fastify.register(fastifyStatic, {
    root: staticDir,
    prefix: '/',
  });
  fastify.log.info("📂 Dossier public servi statiquement.");
} else {
  fastify.log.warn(`⚠️ Dossier "public" introuvable à ${staticDir}`);
}

fastify.ready(err => {
	if (err) throw err;
		console.log("🚀 Routes enregistrées :");
		fastify.printRoutes();
});
  
// fastify.get('/api/test', async (request, reply) => {

// 	console.log("🔥 Route /api/test appelée");
// 	reply.send({ success: true, message: "Test réussi" });
// });
// --- INITIALISATION DE LA BASE DE DONNÉES ---
async function initDb() {
	const dbDir = path.join(process.cwd(), 'data');
	const dbPath = path.join(dbDir, 'users.db');

	// Créer le dossier s'il n'existe pas
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}

	const db = await open({
		filename: dbPath,
		driver: sqlite3.Database
	});

	await db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL
		)
	`);

	return db;
}

let dbPromise: Promise<Database>;

(async () => {
  try {
    console.log("🔧 Initialisation de la base de données...");
    dbPromise = initDb();
    await dbPromise;
    console.log("✅ Base de données initialisée.");
  } catch (err) {
    console.error("❌ Erreur lors de l'init DB :", err);
    process.exit(1); // crash net avec message
  }
})();




// --- ENDPOINTS ---

// --- Endpoint d'inscription via Google ---
fastify.post('/api/auth/google', async (request, reply) => {
	console.log("🔥 Route /api/auth/google appelée");
	const { id_token } = request.body as { id_token: string };
	console.log(process.env.GOOGLE_CLIENT_ID);

	process.on('uncaughtException', (err) => {
		console.error('🛑 Uncaught Exception:', err.stack || err);
	});
	
	process.on('unhandledRejection', (reason, promise) => {
		console.error('🛑 Unhandled Rejection:', reason);
	});

  	if (!id_token) {
    	return reply.status(400).send({ success: false, message: "Token manquant" });
  	}

  // Vérifier le token Google
  	const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Assurez-vous que GOOGLE_CLIENT_ID est défini dans vos variables d'environnement
  	let ticket;
  	try {
		ticket = await client.verifyIdToken({
  	    idToken: id_token,
  	    audience: process.env.GOOGLE_CLIENT_ID,
    	});
  	} catch (error) {
    	return reply.status(401).send({ success: false, message: "Token Google invalide" });
	}
  
  	const payload = ticket.getPayload();
  	if (!payload || !payload.email) {
  	  return reply.status(400).send({ success: false, message: "Informations introuvables dans le token" });
  	}

  	const email = payload.email;
  	const name = payload.name || "Utilisateur Google";
  
  	try {
  	  const db = await dbPromise;
  	  // Vérifier si l'utilisateur existe déjà
  	  let user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
  	  if (!user) {
  	    // Créer un nouvel utilisateur
  	    // Vous pouvez stocker une chaîne vide ou un mot de passe aléatoire, car l'authentification se fait via Google.
  	    const defaultPassword = ""; // Optionnel, ou utilisez un token généré
  	    await db.run(
  	      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
  	      [name, email, defaultPassword]
  	    );
  	    user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
  	  }
  	  // Générer un token JWT pour votre application
  	  const token = fastify.jwt.sign({ id: user.id, email: user.email });
  	  reply.send({ success: true, token });
  	} catch (err: any) {
  	  reply.status(500).send({ success: false, message: err.message });
  	}
});

// Endpoint d'inscription (register)
fastify.post('/api/register', async (request, reply) => {
	const { name, email, password } = request.body as { name: string; email: string; password: string };

	try {
		const db = await dbPromise;

		// Vérifier si l'utilisateur existe déjà
		const existing = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
		if (existing) {
			reply.status(400).send({ success: false, message: 'Email déjà utilisé' });
			return;
		}

		// Hacher le mot de passe
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insérer l'utilisateur
		await db.run(
			`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
			[name, email, hashedPassword]
		);

		reply.send({ success: true, message: 'Inscription réussie !' });
	} catch (err: any) {
		reply.status(500).send({ success: false, message: err.message });
	}
});

// Endpoint de login
fastify.post('/api/auth/sign_in', async (request, reply) => {
	const { email, password } = request.body as { email: string; password: string };

	try {
		const db = await dbPromise;
		const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);

		if (!user) {
			reply.status(401).send({ success: false, message: 'Utilisateur non trouvé' });
			return;
		}

		// Comparer le mot de passe fourni avec le mot de passe haché stocké
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			reply.status(401).send({ success: false, message: 'Mot de passe invalide' });
			return;
		}

		// Générer un token JWT (incluant par exemple l'id et l'email)
		const token = fastify.jwt.sign({ id: user.id, email: user.email });
		reply.send({ success: true, token });
	} catch (error: any) {
		reply.status(500).send({ success: false, message: error.message });
	}
});

// Autres endpoints (par exemple WebSocket) peuvent rester ici...

// Démarrage du serveur
const start = async () => {
	try {
		console.log("🟡 Tentative de démarrage du serveur...");
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		fastify.log.info("✅ Server is running on port 3000");
		
		// On attend 5 secondes pour détecter un crash éventuel
		console.log("⏳ Serveur lancé, on attend 5 secondes pour voir s'il crashe...");
		setTimeout(() => {
			console.log("✅ Pas de crash dans les 5 secondes !");
		}, 5000);
	} catch (err) {
		fastify.log.error("❌ Erreur au lancement du serveur :", err);
		process.exit(1);
	}
};

start();
