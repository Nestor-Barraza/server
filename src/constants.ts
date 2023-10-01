import dotenv from 'dotenv';
dotenv.config()

export const PARITY_SERVER = process.env.PARITY_SERVER || 'localhost:3001/api'
export const JWT_SECRET = process.env.JWT_SECRET || 'hUs8fDhn9siUw5eHrwe'