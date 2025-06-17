"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGlobalErrorHandling = void 0;
const setupGlobalErrorHandling = () => {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('🛑 Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
        console.error('🛑 Uncaught Exception:', err.stack || err);
        process.exit(1); // ⚠️ Exit pour forcer un redémarrage propre via un gestionnaire comme PM2
    });
};
exports.setupGlobalErrorHandling = setupGlobalErrorHandling;
