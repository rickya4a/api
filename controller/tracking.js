const jwt = require('jsonwebtoken'),
  localStorage = require('localStorage'),
  { pool_whm, pool_mlm, sql } = require('../config/db_config');

exports.index = (req, res, err) => { // urutan paramnya harus req, res
  res.setHeader('Access-Control-Allow-Origin', '*');
  return pool_mlm.then(pool => {
    pool.request()
      .query('SELECT TOP 10 * FROM bbhdr', (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.tracking = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('test');
  return pool_whm.then(pool => {
    pool.request()
      .query('SELECT ID_DO, NO_DO, STATUS, CONVERT(VARCHAR(30), TANGGAL, 20) AS TANGGAL, CREATED_BY FROM T_TRACKING_DO', (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.getDetail = (req, res) => {
  let token = localStorage.getItem('Authorization');
  if(!req.headers.authorization){
    return res.status(401).json({ message: 'Ga boleh masuk'});
  }
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('noDo', req.params.NO_DO)
    .input('courier', localStorage.getItem('kurir'))
    .query(`SELECT a.ID_DO, a.NO_DO, a.ID_COURIER, a.ID_STOCKIES, a.NAMA, a.ALAMAT1, a.ID_WAREHOUSE, a.NO_RESI,
    b.NAMA, c.NAMA_STOCKIES, c.CODE_STOCKIES, d.WAREHOUSE_NAME
    FROM T_DO a
    LEFT JOIN COURIER b on a.ID_COURIER = b.ID
    LEFT JOIN MASTER_STOCKIES c on a.ID_STOCKIES = c.ID_STOCKIES
    LEFT JOIN MASTER_WAREHOUSE d on a.ID_WAREHOUSE = d.ID_WAREHOUSE
    WHERE a.NO_DO = @noDo AND a.ID_COURIER = @courier;
    SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY, BERAT, KOLI
    FROM T_TRACKING_DO WHERE NO_DO = @noDo ORDER BY CREATED_DATE DESC`, (err, result) => {
        if (err) {
          throw err
        } else if (!result.recordsets) {
          res.send({ values: null, message: 'Data not found' })
        } else {
          res.json(result.recordsets)
        }
    })
  })
}

exports.findTracking = (req, res) => {
  let token = localStorage.getItem('Authorization');
  let no_do = req.params.NO_DO;
  if(!req.headers.authorization){
    return res.status(401).json({ message: 'Ga boleh masuk'});
  }
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('noDo', sql.VarChar, no_do)
    .query(`SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE,
      CREATED_BY from T_TRACKING_DO WHERE NO_DO = @noDo`, (err, result) => {
        if (err) {
          throw err
        } else if (!result.recordset) {
          res.status(204).json({ values: null, message: 'Data not found' })
        } else {
          res.json(result.recordsets)
        }
    })
  })
}

exports.insertData = (req, res) => {
  let token = localStorage.getItem('Authorization');
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Ga boleh masuk'});
  }
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('doId', req.body.id_do)
    .input('noDo', req.body.no_do)
    .input('date', req.body.tanggal)
    .input('status', req.body.status)
    .input('dateCreated', req.body.created_date)
    .input('createdBy', req.body.created_by)
    .input('warehouseId', req.body.id_warehouse)
    .input('trackingId', req.body.id_tracking)
    .input('weight', req.body.berat)
    .input('batch', req.body.koli)
    .query(`INSERT INTO T_TRACKING_DO (ID_DO, NO_DO, TANGGAL, STATUS, CREATED_DATE, CREATED_BY, ID_WAREHOUSE, ID_TRACKING, BERAT, KOLI)
      VALUES (@doId, @noDo, CONVERT(VARCHAR(30), @date, 20), @status, CONVERT(VARCHAR(30), @dateCreated, 20),
      @createdBy, @warehouseId, @trackingId, @weight, @batch)`, (err, result) => {
      if (err) throw err
      res.send({ message: 'Success insert data' })
    })
  })
}

exports.findCourier = (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('userName', username).input('password', password)
    .query(`SELECT ID_COURIER, USERNAME, PASSWORD, ID_USERROLE, PARENT_COURIER, NAME
            FROM klink_whm_testing.dbo.MASTER_COURIER
            WHERE USERNAME = @userName AND PASSWORD = @password`, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.status(204).json({ values: null, message: 'User not found' })
      } else {
        let nama = { name: result.recordset[0].NAME }
        let kurir = result.recordset[0].PARENT_COURIER;
        let username = result.recordset[0].USERNAME;
        const token = jwt.sign(nama, password);
        res.setHeader('Authorization', token)
        localStorage.setItem('Authorization', token)
        localStorage.setItem('kurir', kurir)
        localStorage.setItem('username', username)
        res.json({ user: result.recordset, token: token })
      }
    })
  })
}

exports.getTrackingKnetStockis = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_mlm.then(pool => {
    pool.request()
    .input('trcd', sql.VarChar, req.params.trcd)
    .query(`SELECT TOP 1 a.trcd, a.orderno, a.batchno, a.invoiceno, a.etdt, CONVERT(VARCHAR(10), a.batchdt, 120) as batchdt,
              a.createdt, a.createnm, a.dfno, a.distnm, a.loccd, a.loccdnm, a.tdp, a.tbv, a.bnsperiod, b.createnm as cnms_createnm,
              CONVERT(VARCHAR(10), b.createdt, 120) as cnms_createdt, b.receiptno, c.createdt as kw_date, c.createnm as kw_createnm,
              d.GDO, e.createnm as gdo_createnm, CONVERT(VARCHAR(10), e.etdt, 120) as gdo_createdt, e.shipto, f.ID_DO, g.NO_DO
            FROM klink_mlm2010.dbo.V_HILAL_CHECK_BV_ONLINE_HDR a
            LEFT OUTER JOIN klink_mlm2010.dbo.ordivtrh b ON (a.invoiceno = b.invoiceno)
            LEFT OUTER JOIN klink_mlm2010.dbo.billivhdr c ON (b.registerno = c.applyto)
            LEFT OUTER JOIN klink_mlm2010.dbo.intrh d ON (c.trcd = d.applyto)
            LEFT OUTER JOIN klink_mlm2010.dbo.gdohdr e ON (d.GDO = e.trcd)
            LEFT OUTER JOIN klink_whm.dbo.T_DETAIL_DO f ON (f.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = b.receiptno COLLATE SQL_Latin1_General_CP1_CS_AS)
            LEFT OUTER JOIN klink_whm.dbo.T_DO g ON (g.ID_DO COLLATE SQL_Latin1_General_CP1_CS_AS = f.ID_DO COLLATE SQL_Latin1_General_CP1_CS_AS)
            WHERE a.trcd = @trcd`, (err, header) => {
      if (err) {
        throw err
      } else if (!header.recordset) {
        res.send({ header: null, tracking: null })
      } else {
        let id_do = header.recordset[0].ID_DO;
        pool_whm.then(pool => {
          pool.request()
          .input('id_do', id_do)
          .query(`SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY
                  FROM T_TRACKING_DO where ID_DO = @id_do ORDER BY CREATED_DATE DESC`, (err, tracking) => {
            if (err) {
              throw err
            } else if (!tracking.recordsets) {
              res.send({ header: header.recordset, tracking: null})
            } else {
              res.json({ header: header.recordset, tracking: tracking.recordset })
            }
          })
        })
      }
    })
  })
}

exports.getTrackingKnetInv = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('invoiceNo', sql.VarChar, req.params.invoiceno)
    .query(`SELECT a.ID_DO, a.NO_DO, b.NO_KWITANSI, c.GDO, c.trtype, d.trcd as cn_no,
            d.dfno, d.invoiceno, d.loccd, d.registerno, d.whcd, d.trcd, e.fullnm
            FROM klink_whm.dbo.T_DO a
            LEFT OUTER JOIN klink_whm.dbo.T_DETAIL_DO b ON (a.ID_DO = b.ID_DO)
            LEFT OUTER JOIN klink_mlm2010.dbo.intrh c ON (b.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = c.applyto)
            LEFT OUTER JOIN klink_mlm2010.dbo.ordtrh d ON (b.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = d.receiptno)
            LEFT OUTER JOIN klink_mlm2010.dbo.msmemb e ON (e.dfno = d.dfno)
            WHERE d.invoiceno = @invoiceNo
            GROUP BY a.ID_DO, a.NO_DO, b.NO_KWITANSI, c.GDO, c.trtype, d.trcd, d.dfno, d.invoiceno, d.loccd, d.registerno, d.whcd, e.fullnm`, (err, header) => {
      if (err) {
        throw err
      } else if (!header.recordset) {
        res.send({ header: null, tracking: null})
      } else {
        let id_do = header.recordset[0].ID_DO;
        pool.request()
        .input('id_do', id_do)
        .query(`SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY
                FROM T_TRACKING_DO where ID_DO = @id_do ORDER BY CREATED_DATE DESC`, (err, tracking) => {
          if (err) {
            throw err
          } else if (!tracking.recordsets) {
            res.send({ header: header.recordset, tracking: null})
          } else {
            res.json({ header: header.recordset, tracking: tracking.recordset })
          }
        })
      }
    })
  })
}

exports.getDataCourier = (req, res) => {
  let token = localStorage.getItem('Authorization');
  if(!req.headers.authorization){
    return res.status(401).json({ message: 'Ga boleh masuk'});
  }
  //post username and password from client side
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('userName', req.params.username)
    .query(`SELECT a.ID_COURIER, a.USERNAME, a.PASSWORD, a.ID_USERROLE, a.PARENT_COURIER, a.NAME, b.NAMA as NAMA_EKSPEDISI
            FROM MASTER_COURIER a
            INNER JOIN COURIER b ON a.PARENT_COURIER = b.ID
            WHERE a.USERNAME = @userName`, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.send({ values: null, message: 'User Not Found' })
      } else {
        res.json(result.recordset)
      }
    })
  })
}

exports.updatePassCourier = (req, res) => {
  //set header auth
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('userName', req.body.username)
    .input('oldPassword', req.body.oldpassword)
    .input('newPassword', req.body.newpassword)
    .query(`SELECT PASSWORD FROM MASTER_COURIER WHERE USERNAME = @userName AND PASSWORD = @oldPassword`, (err, result) => {
      if (err) throw err
      pool.query(`UPDATE MASTER_COURIER SET PASSWORD = @newPassword WHERE USERNAME = @userName`, (err, result) => {
        if (err) throw err
        res.send({ message: 'Success updated password' })
      })
    })
  })
}

// get list stockies for form do manual wms (testing)
exports.stockies = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return pool_whm.then(pool => {
    pool.request()
      .query(`SELECT ID_STOCKIES, NAMA_STOCKIES, CODE_STOCKIES FROM klink_whm.dbo.MASTER_STOCKIES WHERE IS_ACTIVE = 0
      ORDER BY NAMA_STOCKIES ASC`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

// get list DO where ID_STOCKIES AND TANGGAL_DO
exports.listDO = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .input('stockistId', req.body.id_stockies)
    .input('startDate', req.body.tgl_awal)
    .input('endDate', req.body.tgl_akhir)
    .input('expedition', req.body.ekspedisi)
    .query(`SELECT A.ID_DO, A.NO_DO, A.NAMA, A.NO_RESI, A.ALAMAT1,
      CONVERT(VARCHAR(30), A.TANGGAL_DO, 20) AS TANGGAL_DO,
      A.ID_WAREHOUSE, B.WAREHOUSE_NAME
      FROM klink_whm.dbo.T_DO A
      LEFT JOIN klink_whm.dbo.MASTER_WAREHOUSE B ON A.ID_WAREHOUSE = B.ID_WAREHOUSE
      WHERE A.ID_STOCKIES = @stockistId AND A.IS_FAILED = '0' AND A.ID_COURIER = @expedition
      AND A.CREATED_DATE BETWEEN @startDate AND @endDate`, (err, result) => {
        if (err) throw err
        res.json(result.recordset)
      })
  })
}









