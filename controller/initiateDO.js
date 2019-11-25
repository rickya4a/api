const { pool_whm } = require('../config/db_config');

exports.getDataHeader = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let idstockies = req.params.idstockies;
    console.log(idstockies);

    pool_whm.then(pool => {
    	pool.request()
		  .query(`SELECT TOP 1 b.NAMA_STOCKIES,a.ID_STOCKIES, b. ALAMAT_STOCKIES, a.ID_WAREHOUSE, 
        c.WAREHOUSE_NAME, A.NAMA, A.ALAMAT1, A.ALAMAT2, A.ALAMAT3
      FROM T_SALESSIMULATION a
      LEFT JOIN MASTER_STOCKIES b ON a.ID_STOCKIES = b.ID_STOCKIES
      LEFT JOIN MASTER_WAREHOUSE c ON a.ID_WAREHOUSE = c.ID_WAREHOUSE
      WHERE a.ID_STOCKIES = '${idstockies}'`, 
      (err, result) => {
        if (err) throw err
        res.json(result.recordset)
      })
    })
}

exports.getListProductsKW = (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	let kw = req.params.kw;
	console.log(kw);
	
	pool_whm.then(pool => {
    pool.request()
    .query(`SELECT A.PRODUK_ALIAS_ID, B.ALIAS_CODE, B.IS_BUNDLE, B.ID_PRODUCT
    FROM klink_whm_testing.dbo.T_SALESSIMULATION A
    LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK_ALIAS B ON B.PRODUK_ALIAS_ID = A.PRODUK_ALIAS_ID
    WHERE A.KWITANSI_NO = '${kw}' AND A.IS_ACTIVE = '0'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
	})
}

exports.checkAliasProdSingle = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let alias = req.params.alias;
  console.log(alias);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT COUNT(*) AS JUM FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS a
    JOIN klink_whm_testing.dbo.MASTER_PRODUK b ON b.ID_PRODUCT = a.ID_PRODUCT
    where PRODUK_ALIAS_ID = '${alias}' AND a.IS_BUNDLE = 0`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkBoxProduct = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let product = req.params.product;
  console.log(product);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT COUNT(*) AS EXIST FROM klink_whm_testing.dbo.MASTER_PRODUK WHERE ID_PRODUCT = '${product}' AND BOX != 0`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkAliasProdBundling = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let bundle = req.params.bundle;
  console.log(bundle);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT COUNT(*) AS JUM FROM klink_whm_testing.dbo.DETAIL_BUNDLE A WHERE PRODUK_ALIAS_ID = '${bundle}'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.getDetailBundling = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let bundle = req.params.bundle;
  console.log(bundle);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT ID_PRODUCT FROM klink_whm_testing.dbo.DETAIL_BUNDLE WHERE PRODUK_ALIAS_ID = '${bundle}'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkProduct = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let product = req.params.product;
  console.log(product);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT COUNT(*) AS JUM FROM MASTER_PRODUK WHERE ID_PRODUCT = '${product}'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.processKW = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let kw = req.params.kw;
  console.log(kw);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT A.*, B.IS_BUNDLE 
    FROM klink_whm_testing.dbo.T_SALESSIMULATION A
    LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK_ALIAS B ON A.PRODUK_ALIAS_ID = B.PRODUK_ALIAS_ID
    WHERE B.IS_BUNDLE = 1 AND A.KWITANSI_NO = '${kw}' AND A.IS_BUNDLED = '0'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateFlagProdBundling = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let idsalessimulation = req.params.idsalessimulation;
  console.log(idsalessimulation);

  pool_whm.then(pool => {
    pool.request()
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION SET IS_BUNDLED = 1, IS_ACTIVE = 1 
    WHERE ID_SALESSIMULATION = '${idsalessimulation}'`, 
    (err, result) => {
      if (err) throw err
      res.send({ message: 'Success update data' })
    })
  })
}

exports.processProdBundling = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let alias = req.params.alias;
  console.log(alias);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT B.ID_PRODUCT, B.QTY
    FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS A
    LEFT JOIN klink_whm_testing.dbo.DETAIL_BUNDLE B ON A.PRODUK_ALIAS_ID=B.PRODUK_ALIAS_ID
    WHERE A.PRODUK_ALIAS_ID = '${alias}'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.searchProductCode = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let idproduct = req.params.idproduct;
  console.log(idproduct);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT PRODUCT_CODE FROM klink_whm_testing.dbo.MASTER_PRODUK WHERE ID_PRODUCT = '${idproduct}'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.searchAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let aliascode = req.params.aliascode;
  console.log(aliascode);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT TOP 1 PRODUK_ALIAS_ID FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS WHERE ALIAS_CODE = '${aliascode}' AND IS_ACTIVE = '0'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkDuplicateAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let alias = req.params.alias;
  let kw = req.params.kw;
  console.log(alias);
  console.log(kw);

  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT * FROM klink_whm_testing.dbo.T_SALESSIMULATION WHERE KWITANSI_NO = '${kw}' AND PRODUK_ALIAS_ID = '${alias}'`, 
    (err, result) => {
      if(err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateQtyDuplicateAlias = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let idsalessimulation = req.params.idsalessimulation;
  let qty = req.params.qty;
  console.log(idsalessimulation);
  console.log(qty);
  
  pool_whm.then(pool => {
    pool.request()
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION SET QTY = '${qty}', QTY_SISA = '$qty' WHERE ID_SALESSIMULATION = '${idsalessimulation}'`, 
    (err, result) => {
      if(err) throw err
      res.send({ message: 'Success update data' })
    })
  })
}

exports.updateFlagKw = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let kw = req.params.kw;
  console.log(kw);
  
  pool_whm.then(pool => {
    pool.request()
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION SET IS_ACTIVE = '1' WHERE KWITANSI_NO = '${kw}'`, 
    (err, result) => {
      if(err) throw err
      res.send({ message: 'Success update data' })
    })
  })
}