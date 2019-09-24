const sql = require('mssql'),
      bodyParser = require('body-parser'),
      jwt = require('jsonwebtoken'),
      passport = require('passport'),
      localStorage = require('localStorage');
      // session = require('express-session');

// connection string param
const config = {
  user: 'sa',
  password: 'QwertY@123',
  server: '192.168.22.3',
  database: 'klink_whm_testing' 
}

sql.connect(config, function(err){
  if(err) console.log(err);
  console.log("Success connect to db");
})

const request = new sql.Request();

exports.index = function(req, res, err){ // urutan paramnya harus req, res
  res.setHeader('Access-Control-Allow-Origin', '*');
  if(err) console.log(err)
  let data = {
    status: true, 
    msg: 'Anti JS!'
  }
  res.json(data)
}

let getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/* exports.index = function(req, res, err){
  const token = req.header('Authorization');
  console.log(token);
  if (token) { 
    if(err) console.log(err)
    let data = {
      status: '200', 
      msg: 'Anti JS!'
    }
    res.json(data)
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
} */

exports.tracking = function(req, res){
  localStorage.getItem('Authorization')
  res.setHeader('Access-Control-Allow-Origin', '*');
  request.query('select top 10 * from T_TRACKING_DO', function(err, rows){
    if(err) console.log(err)
    res.json(rows.recordset)
  })
}

exports.getDetail = function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  let NO_DO = req.params.NO_DO;
  let kurir = localStorage.getItem('kurir');
  console.log(NO_DO);
  request.query(
  "select a.ID_DO, a.NO_DO, a.ID_COURIER, a.ID_STOCKIES, a.NAMA, a.ALAMAT1, a.ID_WAREHOUSE, b.NAMA, c.NAMA_STOCKIES, c.CODE_STOCKIES, d.WAREHOUSE_NAME from T_DO a \
   left join COURIER b on a.ID_COURIER = b.ID \
   left join MASTER_STOCKIES c on a.ID_STOCKIES = c.ID_STOCKIES \
   left join MASTER_WAREHOUSE d on a.ID_WAREHOUSE = d.ID_WAREHOUSE \
   WHERE a.NO_DO = '"+NO_DO+"' AND a.ID_COURIER = '"+kurir+"'; \
   select NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY \
   from T_TRACKING_DO where NO_DO = '"+NO_DO+"' ORDER BY CREATED_DATE DESC", function(err, rows){
    if(err) {
      console.log(err)
    } else if(rows.recordset == '') { 
      res.send({ values: null, message: 'Data Not Found'})
    } else{ 
      res.json(rows.recordsets)
    }
  })
}

exports.findTracking = function(req, res){
  let NO_DO = req.params.NO_DO;
  console.log(NO_DO);
  const token = localStorage.getItem('Authorization');
  console.log(token);
  res.setHeader('Authorization', token);
  res.setHeader('Access-Control-Allow-Origin', '*');
  request.query("select NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY from T_TRACKING_DO where NO_DO = '"+NO_DO+"'", function(err, rows){
    if(err) {
      console.log(err)
    } else if(rows.recordset == '') {
      // res.status(204); 
      res.send({ values: null, message: 'Data Not Found'})
    } else{ 
      res.json(rows.recordset)
    }
  })
}

exports.insertData = function(req, res){
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

  request.query("insert into T_TRACKING_DO (ID_DO, NO_DO, TANGGAL, STATUS, CREATED_DATE, CREATED_BY, ID_WAREHOUSE, ID_TRACKING) \
                  values ('"+id_do+"', '"+no_do+"', CONVERT(VARCHAR(30), '"+tanggal+"', 20), '"+status+"', CONVERT(VARCHAR(30), '"+created_date+"', 20), '"+created_by+"', '"+id_warehouse+"', '"+id_tracking+"')",
                  function(error, rows, fields){
                    if(error){
                      console.log(error)
                      console.log(req.body)
                    }else{
                      // res.json(rows) 
                      res.send({ message: 'Success insert new record' })
                    }
                  })

}

exports.findCourier = function(req, res){
  //post username and password from client side
  let username = req.body.username;
  let password = req.body.password;
  console.log(username);
  console.log(password);

  res.setHeader('Access-Control-Allow-Origin', '*');
  request.query("select ID_COURIER, USERNAME, PASSWORD, ID_USERROLE, PARENT_COURIER, NAME \
                  from MASTER_COURIER \
                  where USERNAME = '"+username+"' AND PASSWORD = '"+password+"'", 
                  function(err, rows){
                    if(err) {
                      console.log(err) 
                    } else if(rows.recordset == '') {
                      res.send({ values: null, message: 'User Not Found' })
                    } else {
                      let nama = { name: rows.recordset[0].NAME }
                      let kurir = rows.recordset[0].PARENT_COURIER;
                      let username = rows.recordset[0].USERNAME;
                      const token = jwt.sign(nama, config.password);
                      res.setHeader('Authorization', token)
                      localStorage.setItem('Authorization', token)
                      localStorage.setItem('kurir', kurir)
                      localStorage.setItem('username', username)
                      res.json({ user: rows.recordset, token: token })
                    }
                })
}

exports.getTrackingKnetStockis = function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  let trcd = req.params.trcd;
  console.log(trcd);

  request.query("SELECT  TOP 1 a.trcd, a.orderno, a.batchno, a.invoiceno, a.etdt, CONVERT(VARCHAR(10), a.batchdt, 120) as batchdt, \
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
                  WHERE a.trcd = '"+trcd+"'", 
                function (err, records) {
                  if (err) {
                    console.log(err)
                  } else if (records.recordset == '') { 
                    res.send({ values: null, message: 'Data Not Found'})
                  } else{ 
                    let id_do = records.recordset[0].ID_DO;

                    request.query("select NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY \
                                      from T_TRACKING_DO where ID_DO = '"+id_do+"' ORDER BY CREATED_DATE DESC", function(err, rows){
                                  if(err){
                                    console.log(err)
                                  } else if(rows.recordsets == ''){
                                    res.send({ header: records.recordset, tracking: "Data tidak ditemukan"})
                                  }
                                  else {
                                    res.json([records.recordset, rows.recordset])
                                  }
              
                    })
                  }
              })
}

exports.getTrackingKnetInv= function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  let invoiceno = req.params.invoiceno;
  console.log(invoiceno);

  request.query("SELECT a.ID_DO, a.NO_DO, b.NO_KWITANSI, c.GDO, c.trtype, d.trcd as cn_no, \
                  d.dfno, d.invoiceno, d.loccd, d.registerno, d.whcd, d.trcd \
                  FROM klink_whm_testing.dbo.T_DO a \
                  LEFT OUTER JOIN klink_whm_testing.dbo.T_DETAIL_DO b ON (a.ID_DO = b.ID_DO) \
                  LEFT OUTER JOIN klink_mlm2010.dbo.intrh c ON (b.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = c.applyto) \
                  LEFT OUTER JOIN klink_mlm2010.dbo.ordtrh d ON (b.NO_KWITANSI COLLATE SQL_Latin1_General_CP1_CS_AS = d.receiptno) \
                  WHERE d.invoiceno = '"+invoiceno+"' \
                  GROUP BY a.ID_DO, a.NO_DO, b.NO_KWITANSI, c.GDO, c.trtype, d.trcd, d.dfno, d.invoiceno, d.loccd, d.registerno, d.whcd", 
                function(err, records){
                  if (err) {
                    console.log(err)
                  } else if (records.recordset == '') { 
                    res.send({ values: null, message: 'Data Not Found'})
                  } else{ 
                    let id_do = records.recordset[0].ID_DO;
                    request.query("select NO_DO, STATUS, CONVERT(VARCHAR(30), CREATED_DATE, 20) AS CREATED_DATE, CREATED_BY \
                                      from T_TRACKING_DO where ID_DO = '"+id_do+"' ORDER BY CREATED_DATE DESC", function(err, rows){
                                  if(err){
                                    console.log(err)
                                  } else if(rows.recordsets == ''){
                                    res.send({ header: records.recordset, tracking: "Data tidak ditemukan"})
                                  }
                                  else {
                                    res.json([records.recordset, rows.recordset])
                                  }
  
                    })
                  }
  })
}








