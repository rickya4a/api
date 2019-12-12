const { pool_whm, pool_mlm } = require('../config/db_config')

/**
 * Get data date from database
 *
 * @params   {mixed}  req  request body
 * @params   {mixed}  res  http response
 *
 * @return  {array}
 */
exports.selectDate = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return pool_mlm.then(pool => {
    pool.request()
      .input('startDate', req.params.tglawal)
      .input('endDate', req.params.tglakhir)
      .query(`SELECT createdt FROM getpinaple WHERE createdt BETWEEN @startDate AND @endDate GROUP BY createdt`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.countDate = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('date', req.params.tanggal)
    .query(`SELECT COUNT(*) as JUMT FROM klink_whm_testing.dbo.T_SALESSIMULATION WHERE TRANSAKSI_DATE = @date`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.selectKWByDate = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_mlm.then(pool => {
    pool.request()
    .input('date', req.params.tanggal)
    .query(`SELECT * FROM klink_mlm2010.dbo.getpinaple WHERE createdt = @date`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkStkWms = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('codeStockist', req.params.code_stockies)
    .query(`SELECT COUNT(*) AS STOKIES FROM klink_whm_testing.dbo.MASTER_STOCKIES WHERE CODE_STOCKIES = @codeStockist`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkStkMssc = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_mlm.then(pool => {
    pool.request()
    .input('loccd', req.params.loccd)
    .query(`SELECT loccd, fullnm, addr1 FROM klink_mlm2010.dbo.mssc WHERE loccd = @loccd`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.insertStkWms = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
 
  pool_whm.then(pool => {
    pool.request()
    .input('stockistId', req.body.id_stockies)
    .input('stockistName', req.body.nama_stockies)
    .input('stockistId', req.body.code_stockies)
    .input('stockistAddress', req.body.alamat_stockies)
    .input('createdDate', req.body.created_date)
    .query(`INSERT INTO klink_whm_testing.dbo.MASTER_STOCKIES (ID_STOCKIES, NAMA_STOCKIES, CODE_STOCKIES, ALAMAT_STOCKIES, IS_ACTIVE, CREATED_DATE, CREATED_BY) 
    VALUES (@stockistId, @stockistName, @stockistId', @stockistAddress, '0', @createdDate, 'system')`,
    (err, result) => {
      if (err) throw err
      res.send({ message: 'Success insert data' })
    })
  })
}

exports.countProdukAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('codeAlias', req.params.alias_code)
    .query(`SELECT COUNT(*) AS ALIAS FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS WHERE ALIAS_CODE = @codeAlias`,
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.selectProdukAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('codeAlias', req.params.alias_code)
    .query(`SELECT ALIAS_CODE, PRODUK_ALIAS_ID FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS WHERE ALIAS_CODE = @codeAlias`,
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.insertKWStk = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('salesSimulationId', req.body.id_salessimulation)
    .input('warehouseId', req.body.id_warehouse)
    .input('stockistId', req.body.id_stockies)
    .input('receiptNo', req.body.kwitansi_no)
    .input('aliasId', req.body.produk_alias_id)
    .input('qty', req.body.qty)
    .input('dateCreated', req.body.created_date)
    .input('transactionDate', req.body.transaksi_date)
    .input('restQty', req.body.qty_sisa)
    .query(`INSERT INTO klink_whm_testing.dbo.T_SALESSIMULATION 
    (ID_SALESSIMULATION, ID_WAREHOUSE, ID_STOCKIES, KWITANSI_NO, PRODUK_ALIAS_ID, QTY, CREATED_DATE, 
    TRANSAKSI_DATE, QTY_SEND, QTY_SISA, IS_INDENT, TIPE) 
    VALUES(@salesSimulationId, @warehouseId, @stockistId, @receiptNo, @aliasId, 
    @qty, @dateCreated, @transactionDate, '0', @restQty, '0', 'S')`, 
    (err, result) => {
      if (err) throw err
      res.send({ message: 'Success insert data' })
    })
  })
}

exports.insertKWInv = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('salesSimulationId', req.body.id_salessimulation)
    .input('warehouseId', req.body.id_warehouse)
    .input('stockistId', req.body.id_stockies)
    .input('receiptNo', req.body.kwitansi_no)
    .input('aliasId', req.body.produk_alias_id)
    .input('qty', req.body.qty)
    .input('dateCreated', req.body.created_date)
    .input('transactionDate', req.body.transaksi_date)
    .input('restQty', req.body.qty_sisa)
    .query(`INSERT INTO klink_whm_testing.dbo.T_SALESSIMULATION 
    (ID_SALESSIMULATION, ID_WAREHOUSE, ID_STOCKIES, KWITANSI_NO, PRODUK_ALIAS_ID, QTY, CREATED_DATE, 
    TRANSAKSI_DATE, QTY_SEND, QTY_SISA, IS_INDENT, TIPE) 
    VALUES(@salesSimulationId, @warehouseId, @stockistId, @receiptNo, @aliasId, 
    @qty, @dateCreated, @transactionDate, '0', @restQty, '0', 'I')`, 
    (err, result) => {
      if (err) throw err
      res.send({ message: 'Success insert data' })
    })
  })
}

exports.getRePinaple = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  pool_mlm.then(pool => {
    pool.request()
    .input('date', req.params.tanggal)
    .query(`SELECT * FROM klink_mlm2010.dbo.getpinaple 
    WHERE createdt = @date' 
    AND trcd COLLATE SQL_Latin1_General_CP1_CI_AS NOT  IN  
    (SELECT KWITANSI_NO COLLATE SQL_Latin1_General_CP1_CI_AS 
    FROM klink_whm_testing.dbo.T_SALESSIMULATION WHERE TRANSAKSI_DATE = @date')`, 
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
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


