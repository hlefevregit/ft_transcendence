import dotenv from 'dotenv';

dotenv.config(); // Charge automatiquement ton fichier .env

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
