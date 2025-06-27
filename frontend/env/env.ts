import dotenv from 'dotenv';

dotenv.config(); // Charge automatiquement ton fichier .env

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
