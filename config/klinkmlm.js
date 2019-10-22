const mlm = require('mssql'),
      config = {
        user: 'sa',
        password: 'QwertY@123',
        server: '192.168.22.3',
        database: 'klink_mlm2010'
      };

mlm.connect(config, function(err) {
if (err) 
  console.log(err);
  console.log("Success connect to db klink_mlm2010");
})

module.exports = mlm;