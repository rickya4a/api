import { pool_whm } from '../config/db_config';
import { PreparedStatement, VarChar } from 'mssql';

exports.getDataHeader = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    pool_whm.then(pool => {
      pool.request()
      .input('initiateId', VarChar, req.params.initiate_do_id)
      .query(`SELECT b.NAMA_STOCKIES,a.ID_STOCKIES, b. ALAMAT_STOCKIES,
      a.ID_WAREHOUSE, c.WAREHOUSE_NAME, a.NAMA, a.ALAMAT1, a.ALAMAT2, a.ALAMAT3
      FROM klink_whm_testing.dbo.T_INITIATE_DO a
      LEFT JOIN klink_whm_testing.dbo.MASTER_STOCKIES b
      ON a.ID_STOCKIES = b.ID_STOCKIES
      LEFT JOIN klink_whm_testing.dbo.MASTER_WAREHOUSE c
      ON a.ID_WAREHOUSE = c.ID_WAREHOUSE
      WHERE a.INITIATE_DO_ID = @initiateId`, (err, result) => {
        if (err) throw err
        res.json(result.recordset)
      })
    })
}

exports.getDetailProduct = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('test');

  pool_whm.then(pool => {
    pool.request()
    .input('initiateId', VarChar, req.params.initiate_do_id)
    .query(`SELECT E.PRODUCT_CODE, E.PRODUCT_NAME,
      E.ID_PRODUCT, SUM(b.QTY_SISA) AS QTYDELIVERY
      FROM klink_whm_testing.dbo.T_DETAIL_INITIATE_DO a
      LEFT join klink_whm_testing.dbo.T_SALESSIMULATION b
      ON a.ID_KWITANSI = b.KWITANSI_NO
      LEFT join klink_whm_testing.dbo.MASTER_PRODUK_ALIAS c
      ON b.PRODUK_ALIAS_ID=c.PRODUK_ALIAS_ID
      LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK E
      ON E.ID_PRODUCT = c.ID_PRODUCT
      WHERE a.INITIATE_DO_ID = @initiateId AND b.QTY_SISA != 0
      AND b.IS_INDENT != 1 AND B.IS_BUNDLED = 0
      GROUP BY E.PRODUCT_CODE, e.PRODUCT_NAME, E.ID_PRODUCT`,
      (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.getListIndent = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('initiateId', VarChar, req.params.initiate_do_id)
    .query(`SELECT E.PRODUCT_CODE, E.PRODUCT_NAME, E.ID_PRODUCT,
      SUM(CASE
        WHEN c.IS_BUNDLE = 1 THEN b.QTY_SISA * D.QTY
        WHEN c.IS_BUNDLE = 0 THEN b.QTY_SISA
      END) AS QTYDELIVERY
      FROM T_DETAIL_INITIATE_DO a
      LEFT JOIN T_SALESSIMULATION b
      ON a.ID_KWITANSI = b.KWITANSI_NO
      LEFT JOIN MASTER_PRODUK_ALIAS c
      ON b.PRODUK_ALIAS_ID = c.PRODUK_ALIAS_ID
      LEFT JOIN DETAIL_BUNDLE d
      ON B.PRODUK_ALIAS_ID = CASE
        WHEN c.IS_BUNDLE = 1 THEN D.PRODUK_ALIAS_ID
      END
      LEFT JOIN MASTER_PRODUK E
      ON E.ID_PRODUCT = CASE
        WHEN c.IS_BUNDLE = 1 THEN d.ID_PRODUCT
        WHEN c.IS_BUNDLE = 0 THEN c.ID_PRODUCT
      END
      WHERE a.INITIATE_DO_ID = @initiateId
      AND b.QTY_SISA != 0 AND b.IS_INDENT !=0
      GROUP BY E.PRODUCT_CODE, e.PRODUCT_NAME, E.ID_PRODUCT`,
      (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.getMasterProduct = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('productId', VarChar, req.params.id_product)
    .query(`SELECT PRODUCT_NAME, PRODUCT_CODE, BOX
      FROM MASTER_PRODUK WHERE ID_PRODUCT = @productId`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkBox = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('productId', VarChar, req.params.id_product)
    .input('warehouseId', VarChar, req.params.id_warehouse)
    .query(`SELECT SUM(qty) AS total
    FROM T_STOCK a
    LEFT JOIN MASTER_RACK b ON a.ID_RACK = b.ID_RACK
    LEFT JOIN MASTER_PRODUK C ON b.ID_PRODUCT = C.ID_PRODUCT
    WHERE b.ID_WAREHOUSE = @warehouseId AND C.STATUS = '0' AND b.DAMAGED = '0'
    AND b.ID_PRODUCT = @productId AND b.CATEGORY = '0'`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkPcs = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('productId', VarChar, req.params.id_product)
    .input('warehouseId', VarChar, req.params.id_warehouse)
    .query(`SELECT SUM(qty) AS total
    FROM T_STOCK a
    LEFT JOIN MASTER_RACK b ON a.ID_RACK = b.ID_RACK
    LEFT JOIN MASTER_PRODUK C ON b.ID_PRODUCT = C.ID_PRODUCT
    WHERE C.STATUS = '0' AND b.ID_WAREHOUSE = @warehouseId
    AND b.DAMAGED = '0' AND b.ID_PRODUCT = @productId
    AND b.CATEGORY = '1'`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.processReceiptNo = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('initiateId', VarChar, req.params.initiate_do_id)
    .query(`SELECT A.ID_KWITANSI
    FROM klink_whm_testing.dbo.T_DETAIL_INITIATE_DO A
    INNER JOIN klink_whm_testing.dbo.T_INITIATE_DO B
    ON A.INITIATE_DO_ID = B.INITIATE_DO_ID
    WHERE A.INITIATE_DO_ID = @initiateId AND B.STATUS != '1'`,
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateFlagInitiate = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('initiateId', VarChar, req.params.initiate_do_id)
    .query(`UPDATE klink_whm_testing.dbo.T_INITIATE_DO SET STATUS = '1'
      WHERE INITIATE_DO_ID = @initiateId`, (err, result) => {
      if (err) throw err
      res.send({ message: 'Success update data' })
    })
  })
}

exports.processProductSingle = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  console.log(req.params.kw);

  pool_whm.then(pool => {
    pool.request()
    .input('receiptNo', VarChar, req.params.kw)
    .query(`SELECT A.KWITANSI_NO , B.ID_PRODUCT, A.QTY_SISA AS QTY,
    A.PRODUK_ALIAS_ID, A.IS_INDENT
    FROM klink_whm_testing.dbo.T_SALESSIMULATION A
    LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK_ALIAS B
    ON A.PRODUK_ALIAS_ID = B.PRODUK_ALIAS_ID
    WHERE A.KWITANSI_NO = @receiptNo AND A.QTY_SISA > 0 AND A.IS_BUNDLED != 1`,
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.upFlagIndentSales = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('receiptNo', VarChar, req.params.kw)
    .input('aliasId', VarChar, req.params.produk_alias_id)
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION SET IS_INDENT = 0
      WHERE KWITANSI_NO = @receiptNo AND PRODUK_ALIAS_ID = @aliasId`,
      (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateFlagIndent = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('receiptNo', VarChar, req.params.kw)
    .input('aliasId', VarChar, req.params.produk_alias_id)
    .query(`UPDATE klink_whm_testing.dbo.T_INDENT SET IS_ACTIVE = 1
      WHERE ID_KWITANSI = @receiptNo AND PRODUK_ALIAS_ID = @aliasId`,
      (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkStockProductBox = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('productId', VarChar, req.params.id_product)
    .input('warehouseId', VarChar, req.params.id_warehouse)
    .query(`SELECT A.ID_RACK, A.ID_PRODUCT, A.QTY, A.EXP_PABRIK, A.EXP_GUDANG,
    C.PRODUCT_NAME, D.WAREHOUSE_NAME
    FROM klink_whm_testing.dbo.T_STOCK A
    LEFT JOIN klink_whm_testing.dbo.MASTER_RACK B
    ON A.ID_RACK = B.ID_RACK
    LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK C
    ON A.ID_PRODUCT = C.ID_PRODUCT
    LEFT JOIN klink_whm_testing.dbo.MASTER_WAREHOUSE D
    ON B.ID_WAREHOUSE = D.ID_WAREHOUSE
    WHERE A.ID_PRODUCT = @productId AND B.CATEGORY = 0
    AND B.ID_WAREHOUSE = @warehouseId AND B.DAMAGED = 0
    AND C.STATUS = 0 AND C.IS_PUSAT = 0
    ORDER BY EXP_GUDANG`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateStock = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('qty', Int, req.params.qty)
    .input('rackId', VarChar, req.params.id_rack)
    .query(`UPDATE klink_whm_testing.dbo.T_STOCK SET QTY = QTY - @qty
      WHERE ID_RACK = $rackId`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateQtySend = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('qty', Int, req.params.qty)
    .input('receiptNo', VarChar, req.params.kw)
    .input('aliasId', VarChar, req.params.produk_alias_id)
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION
      SET QTY_SEND = QTY_SEND + @qty, QTY_SISA = QTY_SISA - @qty
      WHERE KWITANSI_NO = @receiptNo AND PRODUK_ALIAS_ID = @aliasId`,
      (err, result) => {
      if (err) throw err
      res.send({ message: 'Success update data' })
    })
  })
}

exports.checkStockProductPcs = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('warehouseId', VarChar, req.params.id_warehouse)
    .input('productId', VarChar, req.params.id_product)
    .query(`SELECT A.ID_RACK, A.ID_PRODUCT, A.QTY, A.EXP_PABRIK,
    A.EXP_GUDANG, C.PRODUCT_NAME, D.WAREHOUSE_NAME
    FROM klink_whm_testing.dbo.T_STOCK A
    LEFT JOIN klink_whm_testing.dbo.MASTER_RACK B
    ON A.ID_RACK = B.ID_RACK
    LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK C
    ON A.ID_PRODUCT = C.ID_PRODUCT
    LEFT JOIN klink_whm_testing.dbo.MASTER_WAREHOUSE D
    ON B.ID_WAREHOUSE = D.ID_WAREHOUSE
    WHERE A.ID_PRODUCT = @productId AND B.CATEGORY = 1
    AND B.ID_WAREHOUSE = @warehouseId AND B.DAMAGED = 0
    AND C.STATUS = 0 AND C.IS_PUSAT = 0
    ORDER BY EXP_GUDANG`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.checkProductIndent = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('receiptNo', VarChar, req.params.kw)
    .input('aliasId', VarChar, req.params.produk_alias_id)
    .query(`SELECT QTY_SISA FROM klink_whm_testing.dbo.T_SALESSIMULATION
    WHERE KWITANSI_NO = @receiptNo AND PRODUK_ALIAS_ID = @aliasId
    AND IS_INDENT = 0`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.addFlagIndentSales = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('no_do', VarChar, req.params.no_do)
    .input('aliasId', VarChar, req.params.produk_alias_id)
    .input('receiptNo', VarChar, req.params.kw)
    .query(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION
    SET IS_ACTIVE = 0, IS_INDENT = 1, NO_DO = @no_do
    WHERE PRODUK_ALIAS_ID = @aliasId
    AND KWITANSI_NO = @receiptNo`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.updateBatchStock = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .query(`UPDATE klink_whm_testing.dbo.T_STOCK
    SET EXP_PABRIK = NULL, EXP_GUDANG = NULL, EXP_BATCH = NULL,
    NO_BATCH = NULL WHERE QTY = 0 AND EXP_GUDANG IS NOT NULL`,
    (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}
