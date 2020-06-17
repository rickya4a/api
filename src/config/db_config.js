/**
 * Global connection pool to connect every single
 * database
 */
import { ConnectionPool } from 'mssql';

const config = {
  whm: {
    user: 'sa',
    password: 'QwertY@123',
    server: '192.168.22.3',
    database: 'klink_whm'
  },
  mlm: {
    user: 'sa',
    password: 'QwertY@123',
    server: '192.168.22.3',
    database: 'klink_mlm2010',
    requestTimeout: 50000
  },
  ecommerce: {
    user: 'sa',
    password: 'QwertY@123',
    server: '192.168.22.3',
    database: 'db_ecommerce',
    requestTimeout: 50000
  }
}

export const pool_whm = new ConnectionPool(config.whm).connect();
export const pool_mlm = new ConnectionPool(config.mlm).connect();
export const pool_ecommerce = new ConnectionPool(config.ecommerce).connect();