const klinkmlm = require('../config/klinkmlm');

const mlm = new klinkmlm.Request();

exports.selectDate = function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let tglawal = req.body.tglawal;
  let tglakhir = req.body.tglakhir;
  mlm.query(`SELECT createdt FROM getpinaple WHERE createdt BETWEEN ${tglawal} AND ${tglakhir} GROUP BY createdt`,
  function (err, rows) {
    if (err) {
      console.log(err)
    } else {
      res.json(rows.recordset)
    }
  })
}


