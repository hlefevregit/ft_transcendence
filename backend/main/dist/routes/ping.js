"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPingRoute = void 0;
const setupPingRoute = (fastify) => {
    fastify.get('/api/ping', async (request, reply) => {
        reply.send({ success: true, message: 'pong' });
    });
};
exports.setupPingRoute = setupPingRoute;
