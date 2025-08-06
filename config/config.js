import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.SERVER_PORT || 4000;
export const db = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
//    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
//export const jwtSecret = process.env.JWT_SECRET || 'secreto-seguro';