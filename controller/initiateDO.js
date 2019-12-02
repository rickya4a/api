const { pool_whm } = require('../config/db_config');

exports.getDataHeader = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    pool_whm.then(pool => {
      pool.request()
      .input('stockistId', req.params.idstockies)
		  .query(`SELECT TOP 1 b.NAMA_STOCKIES,a.ID_STOCKIES, b. ALAMAT_STOCKIES, a.ID_WAREHOUSE, 
        c.WAREHOUSE_NAME, A.NAMA, A.ALAMAT1, A.ALAMAT2, A.ALAMAT3
      FROM T_SALESSIMULATION a
      LEFT JOIN MASTER_STOCKIES b ON a.ID_STOCKIES = b.ID_STOCKIES
      LEFT JOIN MASTER_WAREHOUSE c ON a.ID_WAREHOUSE = c.ID_WAREHOUSE
      WHERE a.ID_STOCKIES = @stockistId`, 
      (err, result) => {
        if (err) throw err
        res.json(result.recordset)
      })
    })
}

exports.getListProductsKW = (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');

	pool_whm.then(pool => {
    pool.request()
    .input('receiptNo', req.params.kw)
    .query(`SELECT A.PRODUK_ALIAS_ID, B.ALIAS_CODE, B.IS_BUNDLE, B.ID_PRODUCT
    FROM klink_whm_testing.dbo.T_SALESSIMULATION A
    LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK_ALIAS B ON B.PRODUK_ALIAS_ID = A.PRODUK_ALIAS_ID
    WHERE A.KWITANSI_NO = @receiptNo AND A.IS_ACTIVE = '0'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
	})
}

exports.checkAliasProdSingle = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  pool_whm.then(pool => {
    pool.request()
    .input('alias', req.params.alias)
    .query(`SELECT COUNT(*) AS JUM FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS a
    JOIN klink_whm_testing.dbo.MASTER_PRODUK b ON b.ID_PRODUCT = a.ID_PRODUCT
    where PRODUK_ALIAS_ID = @alias AND a.IS_BUNDLE = 0 AND a.IS_ACTIVE = 0`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkBoxProduct = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  pool_whm.then(pool => {
    pool.request()
    .input('product', req.params.product)
    .query(`SELECT COUNT(*) AS EXIST FROM klink_whm_testing.dbo.MASTER_PRODUK WHERE ID_PRODUCT = @product AND BOX != 0`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkAliasProdBundling = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('bundle', req.params.bundle)
    .query(`SELECT COUNT(*) AS JUM FROM klink_whm_testing.dbo.DETAIL_BUNDLE A WHERE PRODUK_ALIAS_ID = @bundle`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.getDetailBundling = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  pool_whm.then(pool => {
    pool.request()
    .input('bundle', req.params.bundle)
    .query(`SELECT ID_PRODUCT FROM klink_whm_testing.dbo.DETAIL_BUNDLE WHERE PRODUK_ALIAS_ID = @bundle`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkProduct = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
 
  pool_whm.then(pool => {
    pool.request()
    .input('product', req.params.product)
    .query(`SELECT COUNT(*) AS JUM FROM MASTER_PRODUK WHERE ID_PRODUCT = @product`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.processKW = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  pool_whm.then(pool => {
    pool.request()
    .input('receiptNo', req.params.kw)
    .query(`SELECT A.*, B.IS_BUNDLE 
    FROM klink_whm_testing.dbo.T_SALESSIMULATION A
    LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK_ALIAS B ON A.PRODUK_ALIAS_ID = B.PRODUK_ALIAS_ID
    WHERE B.IS_BUNDLE = 1 AND A.KWITANSI_NO = @receiptNo AND A.IS_BUNDLED = '0'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateFlagProdBundling = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  pool_whm.then(pool => {
    pool.request()
    .input('salessimulationId', req.params.idsalessimulation)
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION SET IS_BUNDLED = 1, IS_ACTIVE = 1 
    WHERE ID_SALESSIMULATION = @salessimulationId`, 
    (err, result) => {
      if (err) throw err
      res.send({ message: 'Success update data' })
    })
  })
}

exports.processProdBundling = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('alias', req.params.alias)
    .query(`SELECT B.ID_PRODUCT, B.QTY
    FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS A
    LEFT JOIN klink_whm_testing.dbo.DETAIL_BUNDLE B ON A.PRODUK_ALIAS_ID=B.PRODUK_ALIAS_ID
    WHERE A.PRODUK_ALIAS_ID = @alias`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.searchProductCode = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('productId', req.params.idproduct)
    .query(`SELECT PRODUCT_CODE FROM klink_whm_testing.dbo.MASTER_PRODUK WHERE ID_PRODUCT = @productId`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.searchAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
 
  pool_whm.then(pool => {
    pool.request()
    .input('aliasCode', req.params.aliascode)
    .query(`SELECT TOP 1 PRODUK_ALIAS_ID FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS WHERE ALIAS_CODE = @aliasCode AND IS_ACTIVE = '0'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkDuplicateAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('alias', req.params.alias)
    .input('receiptNo', req.params.kw)
    .query(`SELECT * FROM klink_whm_testing.dbo.T_SALESSIMULATION WHERE KWITANSI_NO = @receiptNo AND PRODUK_ALIAS_ID = @alias`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateQtyDuplicateAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('salessimulationId', req.params.idsalessimulation)
    .input('qty', req.params.qty)
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION SET QTY = @qty, QTY_SISA = @qty WHERE ID_SALESSIMULATION = @salessimulationId`, 
    (err, result) => {
      if(err) throw err
      res.send({ message: 'Success update data' })
    })
  })
}

exports.updateFlagKw = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
 
  pool_whm.then(pool => {
    pool.request()
    .input('receiptNo', req.params.kw)
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION SET IS_ACTIVE = '1' WHERE KWITANSI_NO = @receiptNo`, 
    (err, result) => {
      if(err) throw err
      res.send({ message: 'Success update data' })
    })
  })
}