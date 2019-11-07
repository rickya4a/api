const { pool_whm, pool_mlm } = require('../config/db_config')

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
      .query(`SELECT createdt FROM getpinaple WHERE createdt BETWEEN '${tglawal}' AND '${tglakhir}' GROUP BY createdt`, (err, result) => {
      if (err) throw err
      res.json(result)
    })
  })
}

exports.countDate = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let tanggal = req.body.tanggal;
  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT COUNT(*) as JUMT FROM klink_whm_testing.dbo.T_SALESSIMULATION WHERE TRANSAKSI_DATE = '${tanggal}'`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.selectKWByDate = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let tanggal = req.body.tanggal;
  pool_mlm.then(pool => {
    pool.request()
    .query(`SELECT * FROM klink_mlm2010.dbo.getpinaple WHERE createdt = '${tanggal}'`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkStkWms = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let code_stockies = req.body.code_stockies;
  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT COUNT(*) AS STOKIES FROM klink_whm_testing.dbo.MASTER_STOCKIES WHERE CODE_STOCKIES = '${code_stockies}'`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkStkMssc = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let loccd = req.body.loccd;
  pool_mlm.then(pool => {
    pool.request()
    .query(`SELECT * FROM klink_mlm2010.dbo.mssc WHERE loccd = '${loccd}'`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.insertStkWms = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let id_stockies = req.body.id_stockies;
  let nama_stockies = req.body.nama_stockies;
  let code_stockies = req.body.code_stockies;
  let alamat_stockies = req.body.alamat_stockies;
  let created_date = req.body.created_date;
 
  pool_whm.then(pool => {
    pool.request()
    .query(`INSERT INTO klink_whm_testing.dbo.MASTER_STOCKIES (ID_STOCKIES, NAMA_STOCKIES, CODE_STOCKIES, ALAMAT_STOCKIES, IS_ACTIVE, CREATED_DATE, CREATED_BY) 
    VALUES ('${id_stockies}', '${nama_stockies}', '${code_stockies}', '${alamat_stockies}', '0', '${created_date}', 'system')`,
    (err, result) => {
      if (err) throw err
      res.send({ message: 'Success insert data' })
    })
  })
}

exports.countProdukAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let alias_code = req.body.alias_code;
  
  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT COUNT(*) AS ALIAS FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS WHERE ALIAS_CODE = '${alias_code}'`,
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.selectProdukAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let alias_code = req.body.alias_code;

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT ALIAS_CODE, PRODUK_ALIAS_ID FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS WHERE ALIAS_CODE = '${alias_code}'`,
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.insertKWStk = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let id_salessimulation = req.body.id_salessimulation;
  let id_warehouse = req.body.id_warehouse;
  let id_stockies = req.body.id_stockies;
  let kwitansi_no = req.body.kwitansi_no;
  let produk_alias_id = req.body.produk_alias_id;
  let qty = req.body.qty;
  let created_date = req.body.created_date;
  let transaksi_date = req.body.transaksi_date;
  let qty_sisa = req.body.qty_sisa;
  
  pool_whm.then(pool => {
    pool.request()
    .query(`INSERT INTO klink_whm_testing.dbo.T_SALESSIMULATION 
    (ID_SALESSIMULATION, ID_WAREHOUSE, ID_STOCKIES, KWITANSI_NO, PRODUK_ALIAS_ID, QTY, CREATED_DATE, 
    TRANSAKSI_DATE, QTY_SEND, QTY_SISA, IS_INDENT, TIPE) 
    VALUES('${id_salessimulation}', '${id_warehouse}', '${id_stockies}', '${kwitansi_no}', '${produk_alias_id}', 
    '${qty}', '${created_date}', '${transaksi_date}', '0', '${qty_sisa}', '0', 'S')`, 
    (err, result) => {
      if (err) throw err
      res.send({ message: 'Success insert data' })
    })
  })
}

exports.insertKWInv = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let id_salessimulation = req.body.id_salessimulation;
  let id_warehouse = req.body.id_warehouse;
  let id_stockies = req.body.id_stockies;
  let kwitansi_no = req.body.kwitansi_no;
  let produk_alias_id = req.body.produk_alias_id;
  let qty = req.body.qty;
  let created_date = req.body.created_date;
  let transaksi_date = req.body.transaksi_date;
  let qty_sisa = req.body.qty_sisa;
  
  pool_whm.then(pool => {
    pool.request()
    .query(`INSERT INTO klink_whm_testing.dbo.T_SALESSIMULATION 
    (ID_SALESSIMULATION, ID_WAREHOUSE, ID_STOCKIES, KWITANSI_NO, PRODUK_ALIAS_ID, QTY, CREATED_DATE, 
    TRANSAKSI_DATE, QTY_SEND, QTY_SISA, IS_INDENT, TIPE) 
    VALUES('${id_salessimulation}', '${id_warehouse}', '${id_stockies}', '${kwitansi_no}', '${produk_alias_id}', 
    '${qty}', '${created_date}', '${transaksi_date}', '0', '${qty_sisa}', '0', 'I')`, 
    (err, result) => {
      if (err) throw err
      res.send({ message: 'Success insert data' })
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


