var mssql = require('mssql');
var sql = mssql.connect({
  user: 'temp',    
  password: 'password',   
  server: 'localhost',
  database: 'TestEnvironment',
  options: {
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,

  },
},
function(err){
    if (err) console.log(err)
}); 
module.exports = sql
