import dotenv from 'dotenv';
dotenv.config()

export const PARITY_SERVER = process.env.PARITY_SERVER || 'http://ec2-34-203-229-133.compute-1.amazonaws.com:3000/api'
export const JWT_SECRET = process.env.JWT_SECRET || 'tiJzeJyGtF78vhdgI45pelbdd8zzIXH1lA1R96xtCaptrsFU6Xtnezon2lFGVl9b'