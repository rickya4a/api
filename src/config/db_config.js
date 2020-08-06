/**
 * Global connection pool to connect every single
 * database
 */
import { ConnectionPool } from 'mssql';

const config = {
  whm: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_1
  },
  mlm: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_2,
    requestTimeout: 50000
  },
  ecommerce: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_3,
    requestTimeout: 50000
  }
}

export const pool_whm = new ConnectionPool(config.whm).connect();
export const pool_mlm = new ConnectionPool(config.mlm).connect();
export const pool_ecommerce = new ConnectionPool(config.ecommerce).connect();