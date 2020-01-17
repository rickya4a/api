import { pool_mlm, pool_whm } from '../config/db_config';
import { PreparedStatement, VarChar } from 'mssql';
import _ from 'lodash';

/**
 * Get data date from database
 *
 * @params   {mixed}  req  request body
 * @params   {mixed}  res  http response
 *
 * @return  {array}
 */
export async function selectDate(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_mlm);
  ps.input('startDate', VarChar)
  .input('endDate', VarChar)
  .prepare(`SELECT createdt FROM getpinaple
  WHERE createdt BETWEEN @startDate AND @endDate GROUP BY createdt`, err => {
    if (err) throw err;
    ps.execute({
      startDate: req.params.tglawal,
      endDate: req.params.tglakhir
    }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.recordset)) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function countDate(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('date', VarChar)
  .prepare(`SELECT COUNT(*) as JUMT
    FROM klink_whm_testing.dbo.T_SALESSIMULATION
    WHERE TRANSAKSI_DATE = @date`, err => {
    if (err) throw err;
    ps.execute({ date: req.params.tanggal }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.recordset)) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function selectKWByDate(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_mlm);
  ps.input('date', VarChar)
  .prepare(`SELECT * FROM klink_mlm2010.dbo.getpinaple
  WHERE createdt = @date`, err => {
    if (err) throw err;
    ps.execute({ date: req.params.tanggal }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.recordset)) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function checkStkWms(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('codeStockist', VarChar)
  .prepare(`SELECT COUNT(*) AS STOKIES
    FROM klink_whm_testing.dbo.MASTER_STOCKIES
    WHERE CODE_STOCKIES = @codeStockist`, err => {
    if (err) throw err;
    ps.execute({ codeStockist: req.params.code_stockies }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.recordset)) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function checkStkMssc(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_mlm);
  ps.input('loccd', VarChar)
  .prepare(`SELECT loccd, fullnm, addr1 FROM klink_mlm2010.dbo.mssc
  WHERE loccd = @loccd`, err => {
    if (err) throw err;
    ps.execute({ loccd: req.params.loccd }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.recordset)) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function insertStkWms(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('stockistId', VarChar)
  .input('stockistName', VarChar)
  .input('stockistCode', VarChar)
  .input('stockistAddress', VarChar)
  .input('createdDate', VarChar)
  .prepare(`INSERT INTO klink_whm_testing.dbo.MASTER_STOCKIES (
    ID_STOCKIES, NAMA_STOCKIES, CODE_STOCKIES, ALAMAT_STOCKIES,
    IS_ACTIVE, CREATED_DATE, CREATED_BY)
  VALUES (
    @stockistId, @stockistName, @stockistCode', @stockistAddress,
    '0', @createdDate, 'system')`, err => {
    if (err) throw err;
    ps.execute({
      stockistId: req.body.id_stockies,
      stockistName: req.body.nama_stockies,
      stockistCode: req.body.code_stockies,
      stockistAddress: req.body.alamat_stockies,
      createdDate: req.body.created_date
    }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.rowsAffected)) {
        res.status(500).send({message: 'Whoops! Something went wrong'})
      } else {
        res.json({ message: 'Success insert data' })
      }
      return ps.unprepare();
    })
  })
}

export async function countProdukAlias(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('codeAlias', VarChar)
  .prepare(`SELECT COUNT(*) AS ALIAS FROM
  klink_whm_testing.dbo.MASTER_PRODUK_ALIAS
  WHERE ALIAS_CODE = @codeAlias`, err => {
    if (err) throw err;
    ps.execute({ codeAlias: req.params.alias_code }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.recordset)) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function selectProdukAlias(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('codeAlias', VarChar)
  .prepare(`SELECT ALIAS_CODE, PRODUK_ALIAS_ID FROM
  klink_whm_testing.dbo.MASTER_PRODUK_ALIAS
  WHERE ALIAS_CODE = @codeAlias`, err => {
    if (err) throw err;
    ps.execute({ codeAlias: req.params.alias_code }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.recordset)) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

export async function insertKWStk(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('salesSimulationId', VarChar)
  .input('warehouseId', VarChar)
  .input('stockistId', VarChar)
  .input('receiptNo', VarChar)
  .input('aliasId', VarChar)
  .input('qty', VarChar)
  .input('dateCreated', VarChar)
  .input('transactionDate', VarChar)
  .input('restQty', VarChar)
  .prepare(`INSERT INTO klink_whm_testing.dbo.T_SALESSIMULATION (
  ID_SALESSIMULATION, ID_WAREHOUSE, ID_STOCKIES,
  KWITANSI_NO, PRODUK_ALIAS_ID, QTY, CREATED_DATE,
  TRANSAKSI_DATE, QTY_SEND, QTY_SISA, IS_INDENT, TIPE)
  VALUES (
  @salesSimulationId, @warehouseId, @stockistId, @receiptNo,
  @aliasId, @qty, @dateCreated, @transactionDate, '0',
  @restQty, '0', 'S')`, err => {
    if (err) throw err;
      ps.execute({
        salesSimulationId: req.body.id_salessimulation,
        warehouseId: req.body.id_warehouse,
        stockistId: req.body.id_stockies,
        receiptNo: req.body.kwitansi_no,
        aliasId: req.body.produk_alias_id,
        qty: req.body.qty,
        dateCreated: req.body.created_date,
        transactionDate: req.body.transaksi_date,
        restQty: req.body.qty_sisa
      }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.rowsAffected)) {
        res.status(500).send({message: 'Whoops! Something went wrong'})
      } else {
        res.json({ message: 'Success insert data' })
      }
      return ps.unprepare();
    })
  })
}

export async function insertKWInv(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('salesSimulationId', VarChar)
  .input('warehouseId', VarChar)
  .input('stockistId', VarChar)
  .input('receiptNo', VarChar)
  .input('aliasId', VarChar)
  .input('qty', VarChar)
  .input('dateCreated', VarChar)
  .input('transactionDate', VarChar)
  .input('restQty', VarChar)
  .prepare(`INSERT INTO klink_whm_testing.dbo.T_SALESSIMULATION (
  ID_SALESSIMULATION, ID_WAREHOUSE, ID_STOCKIES, KWITANSI_NO, PRODUK_ALIAS_ID,
  QTY, CREATED_DATE, TRANSAKSI_DATE, QTY_SEND, QTY_SISA, IS_INDENT, TIPE)
  VALUES (
  @salesSimulationId, @warehouseId, @stockistId, @receiptNo, @aliasId,
  @qty, @dateCreated, @transactionDate, '0', @restQty, '0', 'I')`, err => {
    if (err) throw err;
      ps.execute({
        salesSimulationId: req.body.id_salessimulation,
        warehouseId: req.body.id_warehouse,
        stockistId: req.body.id_stockies,
        receiptNo: req.body.kwitansi_no,
        aliasId: req.body.produk_alias_id,
        qty: req.body.qty,
        dateCreated: req.body.created_date,
        transactionDate: req.body.transaksi_date,
        restQty: req.body.qty_sisa
      }, (err, result) => {
      if (err) {
        throw err;
      } else if (_.isEmpty(result.rowsAffected)) {
        res.status(500).send({message: 'Whoops! Something went wrong'})
      } else {
        res.json({ message: 'Success insert data' })
      }
      return ps.unprepare();
    })
  })
}

export async function getRePinaple(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_mlm);
  ps.input('date', VarChar)
  .prepare(`SELECT * FROM klink_mlm2010.dbo.getpinaple
  WHERE createdt = @date'
  AND trcd COLLATE SQL_Latin1_General_CP1_CI_AS NOT  IN
  (SELECT KWITANSI_NO COLLATE SQL_Latin1_General_CP1_CI_AS
  FROM klink_whm_testing.dbo.T_SALESSIMULATION
  WHERE TRANSAKSI_DATE = @date')`, err => {
    if (err) throw err;
    ps.execute({ date: req.params.tanggal }, (err, result) => {
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