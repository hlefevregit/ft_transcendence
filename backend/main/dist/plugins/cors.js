"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCors = void 0;
const cors_1 = __importDefault(require("@fastify/cors"));
const setupCors = (fastify) => {
    fastify.register(cors_1.default, {
        origin: ["https://localhost:8080", "https://localhost:5173"],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    });
};
exports.setupCors = setupCors;
