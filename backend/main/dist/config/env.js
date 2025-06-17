"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_CLIENT_ID = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Charge automatiquement ton fichier .env
exports.JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
