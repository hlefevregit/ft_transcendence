"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./utils/errorHandler");
const cors_1 = require("./plugins/cors");
const jwt_1 = require("./plugins/jwt");
const websocket_1 = require("./plugins/websocket");
const static_1 = require("./plugins/static");
const auth_1 = require("./routes/auth");
const register_1 = require("./routes/register");
const ping_1 = require("./routes/ping");
require("./config/env"); // charge .env
const prisma_1 = __importDefault(require("./plugins/prisma")); // Prisma DB
const user_1 = require("./routes/user");
const friends_1 = require("./routes/friends");
const fastify_metrics_1 = __importDefault(require("fastify-metrics"));
const _2fa_1 = require("./routes/2fa");
const pong_1 = require("./routes/pong");
(0, errorHandler_1.setupGlobalErrorHandling)();
const fastify = (0, fastify_1.default)({
    logger: true,
    https: {
        key: fs_1.default.readFileSync(path_1.default.join(__dirname, '../certs/key.pem')),
        cert: fs_1.default.readFileSync(path_1.default.join(__dirname, '../certs/cert.pem')),
    }
});
fastify.register(fastify_metrics_1.default, {
    endpoint: '/metrics',
});
// Lancement du serveur
const start = async () => {
    try {
        // Plugins
        (0, cors_1.setupCors)(fastify);
        (0, jwt_1.setupJwt)(fastify);
        (0, websocket_1.setupWebsocket)(fastify);
        (0, static_1.setupStaticFiles)(fastify);
        fastify.register(prisma_1.default);
        await fastify.register(user_1.setupUserRoutes);
        // Routes
        (0, auth_1.setupAuthRoutes)(fastify);
        (0, register_1.setupRegisterRoute)(fastify);
        (0, ping_1.setupPingRoute)(fastify);
        await fastify.register(friends_1.setupFriendRoutes);
        await fastify.register(_2fa_1.setup2FARoutes);
        await fastify.register(pong_1.setupPongRoutes); // Assurez-vous que cette fonction est définie dans votre code
        await fastify.ready(); // ✅ après tous les .register()
        console.log(fastify.printRoutes());
        fastify.ready().then(() => {
            console.log(fastify.printRoutes());
        });
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        fastify.log.info('✅ Server running at https://localhost:3000');
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
