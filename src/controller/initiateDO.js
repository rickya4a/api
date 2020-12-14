import {
  pool_ecommerce,
  pool_whm,
  pool_whm_testing
} from "../config/db_config";
import { Date, Numeric, PreparedStatement, Request, Transaction, VarChar } from "mssql";
import { each, eachSeries } from "async";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import _ from "lodash";

export async function getDataHeader(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const ps = new PreparedStatement(await pool_whm);

  ps.input('stockistId', VarChar)
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('receiptno', VarChar)
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('alias', VarChar)
  .prepare(`SELECT COUNT(PRODUK_ALIAS_ID) AS JUM
  FROM klink_whm_testing.dbo.MASTER_PRODUK_ALIAS a
  JOIN klink_whm_testing.dbo.MASTER_PRODUK b ON b.ID_PRODUCT = a.ID_PRODUCT
  where PRODUK_ALIAS_ID = @alias
  AND a.IS_BUNDLE = 0 AND a.IS_ACTIVE = 0`, err => {
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('product', VarChar)
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('bundle', VarChar)
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('bundle', VarChar)
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('product', VarChar)
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('receiptNo', VarChar)
  .prepare(`SELECT A.*, B.IS_BUNDLE
  FROM klink_whm_testing.dbo.T_SALESSIMULATION A
  LEFT JOIN klink_whm_testing.dbo.MASTER_PRODUK_ALIAS B
  ON A.PRODUK_ALIAS_ID = B.PRODUK_ALIAS_ID
  WHERE B.IS_BUNDLE = 1 AND A.KWITANSI_NO = @receiptNo
  AND A.IS_BUNDLED = '0'`, err => {
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('salessimulationId', VarChar)
  .prepare(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION
  SET IS_BUNDLED = 1, IS_ACTIVE = 1
  WHERE ID_SALESSIMULATION = @salessimulationId`, err => {
    if (err) throw err;
      ps.execute({
        salessimulationId: req.params.idsalessimulation
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

export async function processProdBundling(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const ps = new PreparedStatement(await pool_whm);

  ps.input('alias', VarChar)
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('productId', VarChar)
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('aliasCode', VarChar)
  .prepare(`SELECT TOP 1 PRODUK_ALIAS_ID FROM
  klink_whm_testing.dbo.MASTER_PRODUK_ALIAS
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

  const ps = new PreparedStatement(await pool_whm);

  ps.input('alias', VarChar)
  .input('receiptNo', VarChar)
  .prepare(`SELECT * FROM klink_whm_testing.dbo.T_SALESSIMULATION
  WHERE KWITANSI_NO = @receiptNo AND PRODUK_ALIAS_ID = @alias`, err => {
    if (err) throw err;
      ps.execute({
        alias: req.params.alias,
        receiptNo: req.params.kw
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

export async function updateQtyDuplicateAlias(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const ps = new PreparedStatement(await pool_whm);

  ps.input('salessimulationId', VarChar)
  .input('qty', VarChar)
  .prepare(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION
  SET QTY = @qty, QTY_SISA = @qty
  WHERE ID_SALESSIMULATION = @salessimulationId`, err => {

    if (err) throw err;

    ps.execute({
      salessimulationId: req.params.idsalessimulation,
      qty: req.params.qty
    }, (err, result) => {

      if (err) throw err;

      if (_.isEmpty(result.recordset))
        return res.status(204).send({
          values: null, message: 'Data not found'
        });

      res.json(result.recordset);

      return ps.unprepare();
    })
  })
}

export async function updateFlagKw(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const ps = new PreparedStatement(await pool_whm);

  ps.input('receiptNo', VarChar)
  .prepare(`UPDATE klink_whm_testing.dbo.T_SALESSIMULATION
  SET IS_ACTIVE = '1' WHERE KWITANSI_NO = @receiptNo`, err => {

    if (err) throw err;

    ps.execute({ receiptNo: req.params.kw }, (err, result) => {

      if (err) throw err;

      if (_.isEmpty(result.recordset))
        return res.status(204).send({
          values: null, message: 'Data not found'
        });

      res.json(result.recordset);

      return ps.unprepare();
    })
  })
}

/**
 * Create delivery order seq number
 *
 * @param   {string}  orderno  Order Number
 *
 * @returns {Promise<array>}  Get products list
 *
 */
export async function checkSalesData(orderno) {
  const pool = await pool_ecommerce;

  let result = await pool.request()
    .input('orderNo', VarChar, orderno)
    .query(
      `SELECT a.orderno, b.idstk, a.whcd,
      CASE
        WHEN d.cat_inv_id_child IS NOT NULL THEN d.cat_inv_id_child
        WHEN d.cat_inv_id_child IS NULL THEN c.prdcd
      END as prdcd,
      CASE
        WHEN d.cat_inv_id_child IS NOT NULL THEN d.cat_desc
        WHEN d.cat_inv_id_child IS NULL THEN c.prdnm
      END as prdnm,
      CASE
        WHEN d.cat_inv_id_child IS NOT NULL THEN d.qty * c.qty
        WHEN d.cat_inv_id_child IS NULL THEN c.qty
      END as qty
      FROM db_ecommerce.dbo.ecomm_trans_shipaddr_sgo a
      INNER JOIN db_ecommerce.dbo.ecomm_trans_hdr_sgo b
        ON a.orderno=b.orderno
      INNER JOIN db_ecommerce.dbo.ecomm_trans_det_prd_sgo c
        ON a.orderno=c.orderno
      LEFT OUTER JOIN db_ecommerce.dbo.master_prd_bundling d
        ON c.prdcd=d.cat_inv_id_parent
      WHERE a.orderno = @orderNo`
    );

  return result.recordset;
}

/**
 * Get product alias id for inserting sales data
 *
 * @param   {string}  prdcd  Product Code
 *
 * @return  {Promise<String>}         Return product alias id
 */
async function _getProductAlias(prdcd) {
  const pool = await pool_whm_testing;

  const productAlias = await pool.request()
                          .input('prdcd', prdcd)
                          .query(`SELECT PRODUK_ALIAS_ID AS alias_id FROM
                          MASTER_PRODUK_ALIAS
                          WHERE ALIAS_CODE = @prdcd`);

  return productAlias.recordset[0].alias_id;
}

/**
 * Get warehouse id
 *
 * @param   {string}  warehousecode  Warehouse code from sales data
 *
 * @return  {Promise<String>}        Warehouse ID
 */
async function _getWhId(warehousecode) {
  const result = (await pool_whm_testing)
                .query`SELECT ID_WAREHOUSE AS id
                  FROM MASTER_WAREHOUSE
                  WHERE WAREHOUSE_CODE = ${warehousecode}`;

  return (await result).recordset[0].id
}

/**
 * Check data is not exists in table T_SALESSIMULATION
 *
 * @param   {string}  orderno  Order no
 *
 * @return  {Promise<String>}         Return product alias id
 */
async function _checkDataSales(orderno) {
  const pool = await pool_whm_testing;

  const dataAlias = await pool.request()
                          .input('orderno', orderno)
                          .query(`SELECT * FROM T_SALESSIMULATION ts WHERE
                            ts.KWITANSI_NO = @orderno`);

  return dataAlias.recordset;
}

/**
 * Get sales data
 *
 * @param   {string}  orderno  Order number
 *
 * @return  {Promise<Object>|Boolean} Return sales data if product alias
 *                                  same as product per transaction
 */
export async function getSalesData(orderno) {
  // Fetch sales data
  let _getSales = await checkSalesData(orderno);

  // Get product code list from sales data
  let productCode = _getSales.map(el => el.prdcd);

  // Check alias list from sales data
  let _aliasList = (await
                      (await pool_whm_testing)
                      .query`SELECT PRODUK_ALIAS_ID FROM
                        MASTER_PRODUK_ALIAS
                        WHERE ALIAS_CODE IN (${productCode})`
                    ).recordset;

  // Check if product code alias is valid as in _aliasList
  if (_aliasList.length !== productCode.length)
    return false;

  // Create updated sales data for importing/inserting to WMS
  let salesData = await Promise.all(_getSales.map(async obj => ({
    ...obj,
    id_warehouse: await _getWhId(obj.whcd),
    product_alias: await _getProductAlias(obj.prdcd)
  })));

  return { message: true, data: salesData }
}

/**
 * Import sales data from COD transaction
 *
 * @param   {mixed}  req  http request
 * @param   {mixed}  res  http response
 *
 * @return  {Promise<void>}       Response status import sales data
 */
export async function importProduct(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Fetch sales transaction data
  let salesResult = await getSalesData(req.params.orderno);

  // Check if sales product data is available
  if (!salesResult.data)
    return res.json({
      status: false,
      message: 'Master product alias is unavailable'
    });

  const transaction = new Transaction(await pool_whm_testing);

  const request = new Request(transaction);

  // Check sales data
  const _checkData = await _checkDataSales(req.params.orderno);

  // terminate if data exists
  if (!_.isEmpty(_checkData))
    return res.json({
      status: false,
      message: 'Sales data already exists'
    });

  transaction.begin(err => {

    if (err) throw err;

    let rolledBack = false;

    transaction.on('rollback', aborted => { rolledBack = true });

    eachSeries(salesResult.data, (el, callback) => {

      let uuid = uuidv4().split("-").pop();

      request.input('id_salessimulation', uuid)
             .input('id_warehouse', el.id_warehouse)
             .input('id_stockist', el.idstk)
             .input('no_kwitansi', el.orderno)
             .input('product_alias_id', el.product_alias)
             .input('qty', el.qty)
             .input('created_date', moment().format())
             .input('transaction_date', moment().format())
             .input('is_active', 0)
             .input('qty_send', 0)
             .input('qty_left', el.qty)
             .input('is_indent', 0)
             .input('is_bundle', 0)
             .input('type', 'SO');

      request.query(`INSERT INTO T_SALESSIMULATION (
        ID_SALESSIMULATION,
        ID_WAREHOUSE,
        ID_STOCKIES,
        KWITANSI_NO,
        PRODUK_ALIAS_ID,
        QTY,
        CREATED_DATE,
        TRANSAKSI_DATE,
        IS_ACTIVE,
        QTY_SEND,
        QTY_SISA,
        IS_INDENT,
        IS_BUNDLED,
        TIPE
      ) VALUES (
        @id_salessimulation,
        @id_warehouse,
        @id_stockist,
        @no_kwitansi,
        @product_alias_id,
        @qty,
        @created_date,
        @transaction_date,
        @is_active,
        @qty_send,
        @qty_left,
        @is_indent,
        @is_bundle,
        @type
      )`, (err, _) => {
        if (err) return callback(err);

        callback();
      })
    }, err => {
      if (err) {
        transaction.rollback();

        res.status(500).send({
          status: false,
          message: 'Whoops! Something went wrong'
        });
      } else {
        transaction.commit();

        res.json({
          status: true,
          message: 'Success insert data'
        });
      }
    })
  })
}