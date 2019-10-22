const sql = require('mssql');
// connection string param
const config = {
    user: 'sa',
    password: 'QwertY@123',
    server: '192.168.22.3',
    database: 'klink_whm_testing' 
  }
  
sql.connect(config, function(err) {
  if (err) 
    console.log(err);
    console.log("Success connect to db");
})

module.exports = whmTesting;

  