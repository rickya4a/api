import localStorage from 'localStorage';
import { pool_whm, pool_mlm } from '../config/db_config';
import { PreparedStatement, VarChar, DateTime } from 'mssql';
import { verify as _verify, sign } from '../config/auth_service';
import { Base64 } from 'js-base64';

export async function index(req, res) { // urutan paramnya harus req, res
  res.setHeader('Access-Control-Allow-Origin', '*');
  const pool = await pool_mlm;
  pool.request()
  .query('SELECT TOP 10 * FROM bbhdr', (err, result) => {
    if (err) throw err;
    res.json(result.recordset);
  });
}

/**
 * Get all tracking status
 * @return  {array}       get list all tracking lists
 */
export function tracking(req, res) {
  let token = localStorage.getItem('Authorization');
  let verify = _verify(token, 'k-tracking');
  if (!verify) return res.status(401).json({ message: 'Unauthorized' });
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  return pool_whm.then(pool => {
    pool.request()
      .query(`SELECT ID_DO, NO_DO, STATUS, CONVERT(VARCHAR(30), TANGGAL, 20) AS TANGGAL,
      CREATED_BY FROM T_TRACKING_DO`, (err, result) => {
      if (err) throw err;
      res.json(result.recordset);
    })
  })
}

/**
 * Get tracking details
 *
 * @param   {mixed}  req  http request
 * @param   {mixed}  res  http reponse
 *
 * @return  {obj}       get header and detail arrays
 */
export async function getDetail(req, res) {
  let token = localStorage.getItem('Authorization');
  let verify = _verify(token, 'k-tracking');
  if (!verify) return res.status(401).json({ message: 'Unauthorized' });
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('noDo', VarChar)
  .input('courier', VarChar)
  .prepare(`SELECT a.ID_DO, a.NO_DO, a.ID_COURIER, a.ID_STOCKIES, a.NAMA,
    a.ALAMAT1, a.ID_WAREHOUSE, a.NO_RESI,b.NAMA,
    c.NAMA_STOCKIES, c.CODE_STOCKIES, d.WAREHOUSE_NAME
    FROM T_DO a
    LEFT JOIN COURIER b on a.ID_COURIER = b.ID
    LEFT JOIN MASTER_STOCKIES c on a.ID_STOCKIES = c.ID_STOCKIES
    LEFT JOIN MASTER_WAREHOUSE d on a.ID_WAREHOUSE = d.ID_WAREHOUSE
    WHERE a.NO_DO = @noDo AND a.ID_COURIER = @courier;
    SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20)
    AS CREATED_DATE, CREATED_BY, BERAT, KOLI
    FROM T_TRACKING_DO WHERE NO_DO = @noDo ORDER BY CREATED_DATE DESC`, err => {
    if (err) throw err;
    ps.execute({ noDo: req.params.NO_DO, courier: req.body.kurir }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordsets) {
        res.status(204).send({ values: null, message: 'Data not found' });
      } else {
        res.json(result.recordsets);
      }
      return ps.unprepare();
    })
  })
}

/**
 * get single tracking detail
 *
 * @param   {mixed}  req  http request
 * @param   {mixed}  res  http response
 *
 * @return  {obj}       array detail
 */
export async function findTracking(req, res) {
  let token = localStorage.getItem('Authorization');
  let verify = _verify(token, 'k-tracking');
  if (!verify) return res.status(401).json({ message: 'Unauthorized' });
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('noDo', VarChar)
  .prepare(`SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE,
    CREATED_BY from T_TRACKING_DO WHERE NO_DO = @noDo`, err => {
    if (err) throw err;
    ps.execute({ noDo: req.params.NO_DO }, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.status(204).json({ values: null, message: 'Data not found' })
      } else {
        res.json(result.recordsets)
      }
      return ps.unprepare();
    })
  })
}

/**
 * Insert new tracking data
 *
 * @param   {req}  req  http request body
 * @param   {res}  res  http reponse
 *
 * @return  {obj}       json message
 */
export async function insertData(req, res) {
  let token = localStorage.getItem('Authorization');
  let verify = _verify(token, 'k-tracking');
  if (!verify) return res.status(401).json({ message: 'Unauthorized' });
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('doId', VarChar)
  .input('noDo', VarChar)
  .input('date', VarChar)
  .input('status', VarChar)
  .input('dateCreated', VarChar)
  .input('createdBy', VarChar)
  .input('warehouseId', VarChar)
  .input('trackingId', VarChar)
  .input('weight', VarChar)
  .input('batch', VarChar)
  .prepare(`INSERT INTO T_TRACKING_DO (
      ID_DO, NO_DO, TANGGAL, STATUS, CREATED_DATE,
      CREATED_BY, ID_WAREHOUSE, ID_TRACKING, BERAT, KOLI)
    VALUES (
      @doId, @noDo, CONVERT(VARCHAR(30), @date, 20),
      @status, CONVERT(VARCHAR(30), @dateCreated, 20),
      @createdBy, @warehouseId, @trackingId, @weight, @batch)`, err => {
    if (err) throw err;
    ps.execute({
      doId: req.body.id_do,
      noDo: req.body.no_do,
      date: req.body.tanggal,
      status: req.body.status,
      dateCreated: req.body.created_date,
      createdBy: req.body.created_by,
      warehouseId: req.body.id_warehouse,
      trackingId: req.body.id_tracking,
      weight: req.body.berat,
      batch: req.body.koli
    }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result) {
        res.status(500).send({ message: 'Whoops! Something went wrong' })
      } else {
        res.json({ message: 'Success insert data' })
      }
      return ps.unprepare();
    })
  })
}

/**
 * Get courier data/credentials
 *
 * @param   {mixed}  req  http body request
 * @param   {mixed}  res  http reponse
 *
 * @return  {obj}       get courier credetials(username, id, password)
 */
export async function findCourier(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  if (req.body.appkey != 'k-tracking') return res.status(401).json({ message: 'Unauthorized'});
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('userName', VarChar)
  .input('password', VarChar)
  .prepare(`SELECT ID_COURIER, USERNAME, PASSWORD, ID_USERROLE, PARENT_COURIER, NAME
    FROM klink_whm_testing.dbo.MASTER_COURIER
    WHERE USERNAME = @userName AND PASSWORD = @password`, err => {
    if (err) throw err;
    ps.execute({ userName: username, password: password }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).json({ values: null, message: 'User not found' });
      } else {
        let payload = {
          name: result.recordset[0].NAME,
          password: Base64.encode(result.recordset[0].PASSWORD)
        };
        let kurir = result.recordset[0].PARENT_COURIER;
        let username = result.recordset[0].USERNAME;
        const token = sign(payload, 'k-tracking');
        res.setHeader('Authorization', `Bearer ${token}`);
        setItem('Authorization', token);
        setItem('kurir', kurir);
        setItem('username', username);
        res.json({ user: result.recordset, token: token });
      }
      return ps.unprepare();
    })
  })
}

/**
 * Get tracking info for k-net front-end by trx id
 *
 * @param   {mixed}  req  http url param request
 * @param   {mixed}  res  http response
 *
 * @return  {obj}       array tracking detail
 */
export async function getTrackingKnetStockis(req, res) {
  // -- disable temporarily since K-Net have not implemented JWT token -- //
  /* let token = localStorage.getItem('Authorization');
  if (!req.headers.authorization) return res.status(401).json({ message: 'Unauthorized'});
  res.setHeader('Authorization', `Bearer ${token}`); */
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_mlm);
  ps.input('trcd', VarChar)
  .prepare(`SELECT TOP 1 a.trcd, a.orderno, a.batchno, a.invoiceno, a.etdt,
    CONVERT(VARCHAR(10), a.batchdt, 120) as batchdt, a.createdt, a.createnm,
      a.dfno, a.distnm, a.loccd, a.loccdnm, a.tdp, a.tbv, a.bnsperiod, b.createnm as cnms_createnm,
    CONVERT(VARCHAR(10), b.createdt, 120) as cnms_createdt, b.receiptno,
      c.createdt as kw_date, c.createnm as kw_createnm, d.GDO, e.createnm as gdo_createnm,
    CONVERT(VARCHAR(10), e.etdt, 120) as gdo_createdt, e.shipto, f.ID_DO, g.NO_DO
    FROM klink_mlm2010.dbo.V_HILAL_CHECK_BV_ONLINE_HDR a
    LEFT OUTER JOIN klink_mlm2010.dbo.ordivtrh b
    ON (a.invoiceno = b.invoiceno)
    LEFT OUTER JOIN klink_mlm2010.dbo.billivhdr c
    ON (b.registerno = c.applyto)
    LEFT OUTER JOIN klink_mlm2010.dbo.intrh d
    ON (c.trcd = d.applyto)
    LEFT OUTER JOIN klink_mlm2010.dbo.gdohdr e
    ON (d.GDO = e.trcd)
    LEFT OUTER JOIN klink_whm.dbo.T_DETAIL_DO f
    ON (f.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = b.receiptno COLLATE SQL_Latin1_General_CP1_CS_AS)
    LEFT OUTER JOIN klink_whm.dbo.T_DO g
    ON (g.ID_DO COLLATE SQL_Latin1_General_CP1_CS_AS = f.ID_DO COLLATE SQL_Latin1_General_CP1_CS_AS)
    WHERE a.trcd = @trcd`, err => {
    if (err) throw err;
    ps.execute({ trcd: req.params.trcd }, (err, header) => {
      if (err) {
        throw err;
      } else if (!header.recordset) {
        res.status(204).send({ header: null, tracking: null });
      } else {
        let id_do = header.recordset[0].ID_DO;
        pool_whm.then(pool => {
          pool.request()
          .input('id_do', id_do)
          .query(`SELECT NO_DO, STATUS,
            CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY
            FROM T_TRACKING_DO where ID_DO = @id_do ORDER BY CREATED_DATE DESC`,
            (err, tracking) => {
            if (err) {
              throw err;
            } else if (!tracking.recordset) {
              res.send({ header: header.recordset, tracking: null });
            } else {
              res.json({ header: header.recordset, tracking: tracking.recordset });
            }
          })
        })
      }
      return ps.unprepare();
    })
  })
}

/**
 * Get tracking info for k-net front-end by invoice
 *
 * @param   {mixed}  req  http url param request
 * @param   {mixed}  res  http response
 *
 * @return  {obj}       array tracking detail
 */
export async function getTrackingKnetInv(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('invoiceNo', VarChar)
  .prepare(`SELECT a.ID_DO, a.NO_DO, b.NO_KWITANSI,
      c.GDO, c.trtype, d.trcd as cn_no,
      d.dfno, d.invoiceno, d.loccd, d.registerno, d.whcd, d.trcd, e.fullnm
    FROM klink_whm.dbo.T_DO a
    LEFT OUTER JOIN klink_whm.dbo.T_DETAIL_DO b
    ON (a.ID_DO = b.ID_DO)
    LEFT OUTER JOIN klink_mlm2010.dbo.intrh c
    ON (b.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = c.applyto)
    LEFT OUTER JOIN klink_mlm2010.dbo.ordtrh d
    ON (b.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = d.receiptno)
    LEFT OUTER JOIN klink_mlm2010.dbo.msmemb e
    ON (e.dfno = d.dfno)
    WHERE d.invoiceno = @invoiceNo
    GROUP BY a.ID_DO, a.NO_DO, b.NO_KWITANSI, c.GDO, c.trtype, d.trcd,
      d.dfno, d.invoiceno, d.loccd, d.registerno, d.whcd, e.fullnm`, err => {
    if (err) throw err;
    ps.execute({ invoiceNo: req.params.invoiceno }, (err, header) => {
      if (err) {
        throw err;
      } else if (!header.recordset) {
        res.status(204).send({ header: null, tracking: null });
      } else {
        let id_do = header.recordset[0].ID_DO;
        pool_whm.then(pool => {
          pool.request()
          .input('id_do', id_do)
          .query(`SELECT NO_DO, STATUS,
              CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY
            FROM T_TRACKING_DO where ID_DO = @id_do ORDER BY CREATED_DATE DESC`,
          (err, tracking) => {
            if (err) {
              throw err;
            } else if (!tracking.recordset) {
              res.send({ header: header.recordset, tracking: null });
            } else {
              res.json({ header: header.recordset, tracking: tracking.recordset });
            }
          })
        })
      }
      return ps.unprepare();
    })
  })
}

/**
 * Get courier data
 *
 * @param   {mixed}  req  http url param request
 * @param   {mixed}  res  http response
 *
 * @return  {obj}       array courier data
 */
export async function getDataCourier(req, res) {
  let token = localStorage.getItem('Authorization');
  let verify = _verify(token, 'k-tracking');
  if (!verify) return res.status(401).json({ message: 'Unauthorized' });
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('userName', VarChar)
  .prepare(`SELECT a.ID_COURIER, a.USERNAME, a.PASSWORD, a.ID_USERROLE,
            a.PARENT_COURIER, a.NAME, b.NAMA as NAMA_EKSPEDISI
            FROM klink_whm_testing.dbo.MASTER_COURIER a
            INNER JOIN COURIER b ON a.PARENT_COURIER = b.ID
            WHERE a.USERNAME = @userName`, err => {
    if (err) throw err;
    ps.execute({ userName: req.params.username }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).send({ values: null, message: 'User Not Found' });
      } else {
        res.json(result.recordset);
      }
      return ps.unprepare();
    })
  })
}

/**
 * Update courier password
 *
 * @param   {mixed}  req  http body request
 * @param   {mixed}  res  http response
 *
 * @return  {obj}       json message
 */
export async function updatePassCourier(req, res) {
  let token = localStorage.getItem('Authorization');
  let verify = _verify(token, 'k-tracking');
  if (!verify) return res.status(401).json({ message: 'Unauthorized' });
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('userName', VarChar)
  .input('oldPassword', VarChar)
  .input('newPassword', VarChar)
  .prepare(`SELECT PASSWORD FROM klink_whm_testing.dbo.MASTER_COURIER
  WHERE USERNAME = @userName AND PASSWORD = @oldPassword`, err => {
    if (err) throw err;
    ps.execute({
      userName: req.body.username,
      oldPassword: req.body.oldpassword
    }, (err, result) => {
      if (err) {
        throw err
      } else if (!result) {
        res.send({ message: 'Data not found' })
      } else {
        pool_whm.then(pool => {
          pool.request()
          .input('newPassword', req.body.newpassword)
          .input('userName', req.body.username)
          .query(`UPDATE klink_whm_testing.dbo.MASTER_COURIER
            SET PASSWORD = @newPassword WHERE USERNAME = @userName`,
          (err, result) => {
            if (err) {
              throw err;
            } else if (!result) {
              res.status(500).send({ message: 'Whoops! Something went wrong' })
            }
            res.json({ message: 'Success updated password' });
          })
        })
      }
      return ps.unprepare();
    })
  })
}

// get list stockies for form do manual wms (testing)
export async function stockies(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const pool = await pool_whm;
  pool.request()
  .query(`SELECT ID_STOCKIES, NAMA_STOCKIES, CODE_STOCKIES
    FROM klink_whm.dbo.MASTER_STOCKIES WHERE IS_ACTIVE = 0
    ORDER BY NAMA_STOCKIES ASC`, (err, result) => {
    if (err) throw err;
    res.json(result.recordset);
  });
}

/**
 * Get list DO by stockist ID and date range
 *
 * @param   {mixed}  req  http body request
 * @param   {mixed}  res  http reponse
 *
 * @return  {obj}       Delivery order lists by stockist
 */
export async function listDO(req, res) {
  let token = localStorage.getItem('Authorization');
  let verify = _verify(token, 'k-tracking');
  if (!verify) return res.status(401).json({ message: 'Unauthorized' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('stockistId', VarChar)
  .input('startDate', VarChar)
  .input('endDate', VarChar)
  .input('expedition', VarChar)
  .prepare(`SELECT A.ID_DO, A.NO_DO, A.NAMA, A.NO_RESI, A.ALAMAT1,
  CONVERT(VARCHAR(30), A.TANGGAL_DO, 20) AS TANGGAL_DO,
    A.ID_WAREHOUSE, B.WAREHOUSE_NAME
  FROM klink_whm.dbo.T_DO A
  LEFT JOIN klink_whm.dbo.MASTER_WAREHOUSE B
  ON A.ID_WAREHOUSE = B.ID_WAREHOUSE
  WHERE A.ID_STOCKIES = @stockistId
  AND A.IS_FAILED = '0'
  AND A.ID_COURIER = @expedition
  AND A.CREATED_DATE BETWEEN @startDate AND @endDate`, err => {
    if (err) throw err;
    ps.execute({
      stockistId: req.body.id_stockies,
      startDate: req.body.tgl_awal,
      endDate: req.body.tgl_akhir,
      expedition: req.body.ekspedisi
    }, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.status(204).json({ values: null, message: 'Data not found' })
      } else {
        res.json(result.recordset);
      }
    })
  })
}

/**
 * Get list DO by courier ID and date range
 *
 * @param   {mixed}  req  http body request
 * @param   {mixed}  res  http reponse
 *
 * @return  {obj}       Delivery order lists by courier
 */
export async function getDoByDate(req, res) {
  let token = localStorage.getItem('Authorization');
  let verify = _verify(token, 'k-tracking');
  if (!verify) return res.status(401).json({ message: 'Unauthorized' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_whm);
  ps.input('startDate', VarChar)
  .input('endDate', VarChar)
  .input('courierId', VarChar)
    .prepare(`SELECT A.ID_DO, A.NO_DO, A.ID_STOCKIES, A.NAMA, A.ALAMAT1 AS ALAMAT,
      A.NO_RESI,CONVERT(VARCHAR(30), A.TANGGAL_DO, 20) AS TANGGAL_DO,
      A.ID_WAREHOUSE, B.WAREHOUSE_NAME
    FROM T_DO A
    LEFT JOIN MASTER_WAREHOUSE B ON A.ID_WAREHOUSE = B.ID_WAREHOUSE
    WHERE A.IS_FAILED = '0' AND A.ID_COURIER = @courierId
    AND A.CREATED_DATE BETWEEN @startDate AND @endDate`, err => {
    if (err) throw err;
    ps.execute({
      startDate: req.body.tgl_awal,
      endDate: req.body.tgl_akhir,
      courierId: req.body.kurir
    }, (err, t_do) => {
      if (err) {
        throw err
      } else if (!t_do.recordset) {
        res.status(204).json({ values: null, message: 'Data not found' })
      } else {
        pool_whm.then(pool => {
          pool.request()
          .input('startDate', req.body.tgl_awal)
          .input('endDate', req.body.tgl_akhir)
          .input('courierId', req.body.kurir)
          .query(`SELECT A.ID_MANUAL_DO AS ID_DO, A.NO_MANUAL_DO AS NO_DO,
              A.ID_STOCKIES, A.NAMA_STOCKIES AS NAMA, A.ALAMAT_STOCKIES AS ALAMAT,
              A.NO_RESI, CONVERT(VARCHAR(30), A.TANGGAL_DO, 20) AS TANGGAL_DO,
              A.ID_WAREHOUSE, B.WAREHOUSE_NAME
            FROM T_MANUAL_DO A
            LEFT JOIN MASTER_WAREHOUSE B ON A.ID_WAREHOUSE = B.ID_WAREHOUSE
            WHERE A.ID_COURIER = @courierId
            AND A.CREATED_DATE BETWEEN @startDate AND @endDate`,
            (err, t_do_manual) => {
            if (err) {
              throw err;
            } else if (!t_do_manual.recordset) {
              res.status(204).json({ values: null, message: 'Data not found' })
            } else {
              let items = t_do.recordset.concat(t_do_manual.recordset)
              res.json(items)
            }
          })
        })
      }
    })
  })
}