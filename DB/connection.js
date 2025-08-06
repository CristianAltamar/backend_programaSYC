import { db } from "../config/config.js";
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
    host: db.host,
    user: db.user,
//    password: db.password,
    database: db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});