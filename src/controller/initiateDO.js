import { pool_whm, sql } from "../config/db_config";

export async function getDataHeader(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('stockistId', sql.VarChar)
  .prepare(`SELECT TOP 1 b.NAMA_STOCKIES, a.ID_STOCKIES, b. ALAMAT_STOCKIES,
  a.ID_WAREHOUSE, c.WAREHOUSE_NAME, A.NAMA, A.ALAMAT1, A.ALAMAT2, A.ALAMAT3
  FROM T_SALESSIMULATION a
  LEFT JOIN MASTER_STOCKIES b ON a.ID_STOCKIES = b.ID_STOCKIES
  LEFT JOIN MASTER_WAREHOUSE c ON a.ID_WAREHOUSE = c.ID_WAREHOUSE
  WHERE a.ID_STOCKIES = @stockistId`, err => {
    if (err) throw err;
    ps.execute({ stockistId: req.params.idstockies }, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordsets);
      }
      return ps.unprepare();
    })
  })
}

export async function getListProductsKW(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('receiptno', sql.VarChar)
  .prepare(`SELECT A.PRODUK_ALIAS_ID, B.ALIAS_CODE, B.IS_BUNDLE, B.ID_PRODUCT
  FROM klink_whm_testing.dbo.T_SALESSIMULATION A
  LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK_ALIAS B
  ON B.PRODUK_ALIAS_ID = A.PRODUK_ALIAS_ID
  WHERE A.KWITANSI_NO = @receiptNo AND A.IS_ACTIVE = '0'`, err => {
    if (err) throw err;
    ps.execute({ receiptno: req.params.kw }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordsets);
      }
      return ps.unprepare();
    })
  })
}

export async function checkAliasProdSingle(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('alias', sql.VarChar)
  .prepare(`SELECT COUNT(PRODUK_ALIAS_ID) AS JUM
  FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS a
  JOIN klink_whm_testing.dbo.MASTER_PRODUK b ON b.ID_PRODUCT = a.ID_PRODUCT
  where PRODUK_ALIAS_ID = @alias AND a.IS_BUNDLE = 0 AND a.IS_ACTIVE = 0`, err => {
    if (err) throw err;
    ps.execute({ alias: req.params.alias }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordsets);
      }
      return ps.unprepare();
    })
  })
}

export async function checkBoxProduct(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('product', sql.VarChar)
  .prepare(`SELECT COUNT(ID_PRODUCT) AS EXIST
  FROM klink_whm_testing.dbo.MASTER_PRODUK
  WHERE ID_PRODUCT = @product AND BOX != 0`, err => {
    if (err) throw err;
    ps.execute({ product: req.params.product }, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordsets);
      }
      return ps.unprepare();
    })
  })
}

export async function checkAliasProdBundling(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('bundle', sql.VarChar)
  .prepare(`SELECT COUNT(PRODUK_ALIAS_ID) AS JUM
  FROM klink_whm_testing.dbo.DETAIL_BUNDLE A
  WHERE PRODUK_ALIAS_ID = @bundle`, err => {
    if (err) throw err;
    ps.execute({ bundle: req.params.bundle }, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordsets);
      }
      return ps.unprepare();
    })
  })
}

export async function getDetailBundling(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('bundle', sql.VarChar)
  .prepare(`SELECT ID_PRODUCT FROM klink_whm_testing.dbo.DETAIL_BUNDLE
  WHERE PRODUK_ALIAS_ID = @bundle`, err => {
    if (err) throw err;
    ps.execute({ bundle: req.params.bundle }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function checkProduct(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('product', sql.VarChar)
  .prepare(`SELECT COUNT(ID_PRODUCT) AS JUM FROM MASTER_PRODUK
  WHERE ID_PRODUCT = @product`, err => {
    if (err) throw err;
    ps.execute({ product: req.params.product }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function processKW(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('receiptNo', sql.VarChar)
  .prepare(`SELECT A.*, B.IS_BUNDLE
  FROM klink_whm_testing.dbo.T_SALESSIMULATION A
  LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK_ALIAS B
  ON A.PRODUK_ALIAS_ID = B.PRODUK_ALIAS_ID
  WHERE B.IS_BUNDLE = 1 AND A.KWITANSI_NO = @receiptNo AND A.IS_BUNDLED = '0'`, err => {
    if (err) throw err;
    ps.execute({ receiptNo: req.params.kw }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function updateFlagProdBundling(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('salessimulationId', sql.VarChar)
  .prepare(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION SET IS_BUNDLED = 1, IS_ACTIVE = 1
  WHERE ID_SALESSIMULATION = @salessimulationId`, err => {
    if (err) throw err;
    ps.execute({ salessimulationId: req.params.idsalessimulation }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function processProdBundling(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('alias', sql.VarChar)
  .prepare(`SELECT B.ID_PRODUCT, B.QTY
  FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS A
  LEFT JOIN klink_whm_testing.dbo.DETAIL_BUNDLE B
  ON A.PRODUK_ALIAS_ID = B.PRODUK_ALIAS_ID
  WHERE A.PRODUK_ALIAS_ID = @alias`, err => {
    if (err) throw err;
    ps.execute({ alias: req.params.alias }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function searchProductCode(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('productId', sql.VarChar)
  .prepare(`SELECT PRODUCT_CODE FROM klink_whm_testing.dbo.MASTER_PRODUK
  WHERE ID_PRODUCT = @productId`, err => {
    if (err) throw err;
    ps.execute({ productId: req.params.idproduct }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function searchAlias(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('aliasCode', sql.VarChar)
  .prepare(`SELECT TOP 1 PRODUK_ALIAS_ID FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS
  WHERE ALIAS_CODE = @aliasCode AND IS_ACTIVE = '0'`, err => {
    if (err) throw err;
    ps.execute({ aliasCode: req.params.aliascode }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function checkDuplicateAlias(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('alias', sql.VarChar)
  .input('receiptNo', sql.VarChar)
  .prepare(`SELECT * FROM klink_whm_testing.dbo.T_SALESSIMULATION
  WHERE KWITANSI_NO = @receiptNo AND PRODUK_ALIAS_ID = @alias`, err => {
    if (err) throw err;
    ps.execute({ alias: req.params.alias, receiptNo: req.params.kw }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function updateQtyDuplicateAlias(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('salessimulationId', sql.VarChar)
  .input('qty', sql.VarChar)
  .prepare(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION
  SET QTY = @qty, QTY_SISA = @qty WHERE ID_SALESSIMULATION = @salessimulationId`, err => {
    if (err) throw err;
    ps.execute({
      salessimulationId: req.params.idsalessimulation,
      qty: req.params.qty
    }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function updateFlagKw(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new sql.PreparedStatement(await pool_whm);
  ps.input('receiptNo', sql.VarChar)
  .prepare(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION
  SET IS_ACTIVE = '1' WHERE KWITANSI_NO = @receiptNo`, err => {
    if (err) throw err;
    ps.execute({ receiptNo: req.params.kw }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}