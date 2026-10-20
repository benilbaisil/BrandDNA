import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load from project root .env (single unified env file)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// 2. Fallback to server/.env if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// 3. Fallback to process.cwd() .env
dotenv.config();
