"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStaticFiles = void 0;
const static_1 = __importDefault(require("@fastify/static"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const setupStaticFiles = (fastify) => {
    const staticDir = path_1.default.join(process.cwd(), 'public');
    if (fs_1.default.existsSync(staticDir)) {
        fastify.register(static_1.default, {
            root: staticDir,
            prefix: '/',
        });
        fastify.log.info("📂 Dossier public servi statiquement.");
    }
    else {
        fastify.log.warn(`⚠️ Dossier "public" introuvable à ${staticDir}`);
    }
};
exports.setupStaticFiles = setupStaticFiles;
