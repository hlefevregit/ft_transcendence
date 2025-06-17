"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupJwt = void 0;
// backend/src/plugins/jwt.ts
const jwt_1 = __importDefault(require("@fastify/jwt"));
const env_1 = require("../config/env");
const setupJwt = (fastify) => {
    // Enregistre le plugin JWT avec ta clé secrète
    fastify.register(jwt_1.default, { secret: env_1.JWT_SECRET });
    // Décore l'instance Fastify avec une méthode `authenticate` utilisable comme middleware
    fastify.decorate('authenticate', async function (request, reply) {
        // console.log("🔐 Authorization header:", request.headers.authorization); // 👀
        try {
            await request.jwtVerify();
            // console.log("✅ User decoded:", request.user); // 👀
        }
        catch (err) {
            console.error("❌ JWT error:", err);
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
};
exports.setupJwt = setupJwt;
