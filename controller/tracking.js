const jwt = require('jsonwebtoken'),
  localStorage = require('localStorage'),
  { pool_whm, pool_mlm } = require('../config/db_config');

exports.index = function(req, res, err) { // urutan paramnya harus req, res
  res.setHeader('Access-Control-Allow-Origin', '*');
  return pool_mlm.then(pool => {
    pool.request()
      .query('SELECT TOP 10 * FROM bbhdr', (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.tracking = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return pool_whm.then(pool => {
    pool.request()
      .query('SELECT ID_DO, NO_DO, STATUS, CONVERT(VARCHAR(30), TANGGAL, 20) AS TANGGAL, CREATED_BY FROM T_TRACKING_DO', (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

exports.getDetail = function(req, res) {
  let token = localStorage.getItem('Authorization');
  if(!req.headers.authorization){
    return res.status(401).json({ message: 'Ga boleh masuk'});
  }
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  let no_do = req.params.NO_DO;
  let kurir = localStorage.getItem('kurir');
  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT a.ID_DO, a.NO_DO, a.ID_COURIER, a.ID_STOCKIES, a.NAMA, a.ALAMAT1, a.ID_WAREHOUSE, b.NAMA, c.NAMA_STOCKIES, c.CODE_STOCKIES, d.WAREHOUSE_NAME FROM T_DO a \
    LEFT JOIN COURIER b on a.ID_COURIER = b.ID \
    LEFT JOIN MASTER_STOCKIES c on a.ID_STOCKIES = c.ID_STOCKIES \
    LEFT JOIN MASTER_WAREHOUSE d on a.ID_WAREHOUSE = d.ID_WAREHOUSE \
    WHERE a.NO_DO = '${no_do}' AND a.ID_COURIER = '${kurir}'; \
    SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY \
    FROM T_TRACKING_DO WHERE NO_DO = '${no_do}' ORDER BY CREATED_DATE DESC`, (err, result) => {
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

exports.findTracking = function(req, res) {
  let token = localStorage.getItem('Authorization');
  let no_do = req.params.NO_DO;
  if(!req.headers.authorization){
    return res.status(401).json({ message: 'Ga boleh masuk'});
  }
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
      .query(`SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY from T_TRACKING_DO WHERE NO_DO = '${no_do}'`, (err, result) => {
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

exports.insertData = function(req, res) {
  let token = localStorage.getItem('Authorization');
  if(!req.headers.authorization){
    return res.status(401).json({ message: 'Ga boleh masuk'});
  }

  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  const username = localStorage.getItem('username');
  let id_do = req.body.id_do;
  let no_do = req.body.no_do;
  let tanggal = req.body.tanggal;
  let status = req.body.status;
  let created_date = req.body.created_date;
  let created_by = username;
  let id_warehouse = req.body.id_warehouse;
  let id_tracking = req.body.id_tracking;
  pool_whm.then(pool => {
    pool.request()
    .query(`INSERT INTO T_TRACKING_DO (ID_DO, NO_DO, TANGGAL, STATUS, CREATED_DATE, CREATED_BY, ID_WAREHOUSE, ID_TRACKING) \
      VALUES ('${id_do}', '${no_do}', CONVERT(VARCHAR(30), '${tanggal}', 20), '${status}', CONVERT(VARCHAR(30), '${created_date}', 20), '${created_by}', '${id_warehouse}', '${id_tracking}')`, (err, result) => {
      if (err) throw err
      res.send({ message: 'Success insert new password' })
    })
  })
}

exports.findCourier = function(req, res) {
  let username = req.body.username;
  let password = req.body.password;

  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT ID_COURIER, USERNAME, PASSWORD, ID_USERROLE, PARENT_COURIER, NAME \
            FROM MASTER_COURIER \
            WHERE USERNAME = '${username}' AND PASSWORD = '${password}'`, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.status(204).json({ values: null, message: 'User not found' })
      } else {
        let nama = { name: result.recordset[0].NAME }
        let kurir = result.recordset[0].PARENT_COURIER;
        let username = result.recordset[0].USERNAME;
        const token = jwt.sign(nama, config.password);
        res.setHeader('Authorization', token)
        localStorage.setItem('Authorization', token)
        localStorage.setItem('kurir', kurir)
        localStorage.setItem('username', username)
        res.json({ user: result.recordset, token: token })
      }
    })
  })
}

exports.getTrackingKnetStockis = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let trcd = req.params.trcd;

  pool_mlm.then(pool => {
    pool.request()
    .query(`SELECT TOP 1 a.trcd, a.orderno, a.batchno, a.invoiceno, a.etdt, CONVERT(VARCHAR(10), a.batchdt, 120) as batchdt, \
              a.createdt, a.createnm, a.dfno, a.distnm, a.loccd, a.loccdnm, a.tdp, a.tbv, a.bnsperiod, b.createnm as cnms_createnm, \
              CONVERT(VARCHAR(10), b.createdt, 120) as cnms_createdt, b.receiptno, c.createdt as kw_date, c.createnm as kw_createnm, \
              d.GDO, e.createnm as gdo_createnm, CONVERT(VARCHAR(10), e.etdt, 120) as gdo_createdt, e.shipto, f.ID_DO, g.NO_DO \
            FROM klink_mlm2010.dbo.V_HILAL_CHECK_BV_ONLINE_HDR a \
            LEFT OUTER JOIN klink_mlm2010.dbo.ordivtrh b ON (a.invoiceno = b.invoiceno) \
            LEFT OUTER JOIN klink_mlm2010.dbo.billivhdr c ON (b.registerno = c.applyto) \
            LEFT OUTER JOIN klink_mlm2010.dbo.intrh d ON (c.trcd = d.applyto) \
            LEFT OUTER JOIN klink_mlm2010.dbo.gdohdr e ON (d.GDO = e.trcd) \
            LEFT OUTER JOIN klink_whm.dbo.T_DETAIL_DO f ON (f.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = b.receiptno COLLATE SQL_Latin1_General_CP1_CS_AS) \
            LEFT OUTER JOIN klink_whm.dbo.T_DO g ON (g.ID_DO COLLATE SQL_Latin1_General_CP1_CS_AS = f.ID_DO COLLATE SQL_Latin1_General_CP1_CS_AS) \
            WHERE a.trcd = '${trcd}'`, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.send({ header: null, tracking: null })
      } else {
        let id_do = result.recordset[0].ID_DO;
        pool_whm.then(pool => {
          pool.request()
          .query(`SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY \
                  FROM T_TRACKING_DO where ID_DO = '${id_do}' ORDER BY CREATED_DATE DESC`, (err, result) => {
            if (err) {
              throw err
            } else if (!result.recordsets) {
              res.send({ header: result.recordset, tracking: null})
            } else {
              res.json({ header: result.recordset, tracking: result.recordset })
            }
          })
        })
      }
    })
  })
}

exports.getTrackingKnetInv = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let invoiceno = req.params.invoiceno;
  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT a.ID_DO, a.NO_DO, b.NO_KWITANSI, c.GDO, c.trtype, d.trcd as cn_no, \
            d.dfno, d.invoiceno, d.loccd, d.registerno, d.whcd, d.trcd, e.fullnm \
            FROM klink_whm.dbo.T_DO a \
            LEFT OUTER JOIN klink_whm.dbo.T_DETAIL_DO b ON (a.ID_DO = b.ID_DO) \
            LEFT OUTER JOIN klink_mlm2010.dbo.intrh c ON (b.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = c.applyto) \
            LEFT OUTER JOIN klink_mlm2010.dbo.ordtrh d ON (b.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = d.receiptno) \
            LEFT OUTER JOIN klink_mlm2010.dbo.msmemb e ON (e.dfno = d.dfno) \
            WHERE d.invoiceno = '${invoiceno}' \
            GROUP BY a.ID_DO, a.NO_DO, b.NO_KWITANSI, c.GDO, c.trtype, d.trcd, d.dfno, d.invoiceno, d.loccd, d.registerno, d.whcd, e.fullnm`, (err, result) => {
      if (err) {
        throw err
      } else if (!result.recordset) {
        res.send({ header: null, tracking: null})
      } else {
        let id_do = result.recordset[0].ID_DO;
        pool.request()
        .query(`SELECT NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY \
                FROM T_TRACKING_DO where ID_DO = '${id_do}' ORDER BY CREATED_DATE DESC`, (err, result) => {
          if (err) {
            throw err
          } else if (!result.recordsets) {
            res.send({ header: result.recordset, tracking: null})
          } else {
            res.json({ header: records.recordset, tracking: rows.recordset })
          }
        })
      }
    })
  })
}

exports.getDataCourier = function(req, res) {
  let token = localStorage.getItem('Authorization');
  if(!req.headers.authorization){
    return res.status(401).json({ message: 'Ga boleh masuk'});
  }
  //post username and password from client side
  let username = req.params.username;
  res.setHeader('Authorization', `Bearer ${token}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
    .query(`SELECT a.ID_COURIER, a.USERNAME, a.PASSWORD, a.ID_USERROLE, a.PARENT_COURIER, a.NAME, b.NAMA as NAMA_EKSPEDISI \
            FROM MASTER_COURIER a \
            INNER JOIN COURIER b ON a.PARENT_COURIER = b.ID \
            WHERE a.USERNAME = '${username}'`, (err, result) => {
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

exports.updatePassCourier = function(req, res) {
  //post username and password from client side
  let username = req.body.username;
  let oldpassword = req.body.oldpassword;
  let newpassword = req.body.newpassword;

  //set header auth
  res.setHeader('Access-Control-Allow-Origin', '*');
  pool_whm.then(pool => {
    pool.request()
      .query(`SELECT PASSWORD FROM MASTER_COURIER WHERE USERNAME = '${username}' AND PASSWORD = '${oldpassword}'`, (err, result) => {
      if (err) throw err
      pool.query(`UPDATE MASTER_COURIER SET PASSWORD = '${newpassword}' WHERE USERNAME = '${username}'`, (err, result) => {
        if (err) throw err
        res.send({ message: 'Success updated password' })
      })
    })
  })
}

// get list stockies for form do manual wms (testing)
exports.stockies = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return pool_whm.then(pool => {
    pool.request()
      .query('SELECT ID_STOCKIES, NAMA_STOCKIES, CODE_STOCKIES FROM klink_whm.dbo.MASTER_STOCKIES WHERE IS_ACTIVE = 0 \
      ORDER BY NAMA_STOCKIES ASC', (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })
}

// get list DO where ID_STOCKIES AND TANGGAL_DO
exports.listDO = function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let id_stockies = req.body.id_stockies;
  let tgl_awal = req.body.tgl_awal;
  let tgl_akhir = req.body.tgl_akhir; 
  let ekspedisi = req.body.ekspedisi;

  pool_whm.then(pool => {
    pool.request()
      .query(`SELECT ID_DO, NO_DO, NAMA, NO_RESI,TANGGAL_DO
              FROM T_DO 
              WHERE ID_STOCKIES = '${id_stockies}' AND ID_COURIER = '${ekspedisi}' AND IS_FAILED = '0'
              AND CREATED_DATE BETWEEN '${tgl_awal}' AND '${tgl_akhir}'`, (err, result) => {
              if (err) throw err
              res.json(result.recordset)
      })
  })
}









