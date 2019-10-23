const { pool_mlm } = require('../config/db_config')

/**
 * Get data date from database
 *
 * @param   {mixed}  req  request body
 * @param   {mixed}  res  http response
 *
 * @return  {array}
 */
exports.selectDate = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let tglawal = req.body.tglawal;
  let tglakhir = req.body.tglakhir;
  return pool_mlm.then(pool => {
    pool.request()
      .query(`SELECT createdt FROM getpinaple WHERE createdt BETWEEN ${tglawal} AND ${tglakhir} GROUP BY createdt`, (err, result) => {
      if (err) throw err
      res.json(result)
    })
  })
}

exports.bbhdr = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return pool_mlm.then(pool => {
    pool.request()
      .query('SELECT TOP 10 * FROM bbhdr', (err, result) => {
      if (err) throw err
      res.json(result)
    })
  })
  next()
}


