/**
 * Global connection pool to connect every single
 * database
 */
const sql = require('mssql');

const config_whm = {
  user: 'sa',
  password: 'QwertY@123',
  server: '192.168.22.3',
  database: 'klink_whm_testing'
};
const config_mlm = {
  user: 'sa',
  password: 'QwertY@123',
  server: '192.168.22.3',
  database: 'klink_mlm2010'
};

const pool_whm = new sql.ConnectionPool(config_whm).connect();
const pool_mlm = new sql.ConnectionPool(config_mlm).connect();

module.exports = {
  pool_whm,
  pool_mlm
};