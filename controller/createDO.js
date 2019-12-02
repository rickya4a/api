const { pool_whm } = require('../config/db_config');

exports.getDataHeader = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    pool_whm.then(pool => {
      pool.request()
      .input('initiateId', req.params.initiate_do_id)
		  .query(`SELECT b.NAMA_STOCKIES,a.ID_STOCKIES, b. ALAMAT_STOCKIES,a.ID_WAREHOUSE, c.WAREHOUSE_NAME, a.NAMA, a.ALAMAT1, a.ALAMAT2, a.ALAMAT3 ')
      FROM klink_whm_testing.dbo.T_INITIATE_DO a
      LEFT JOIN klink_whm_testing.dbo.MASTER_STOCKIES b ON a.ID_STOCKIES = b.ID_STOCKIES
      LEFT JOIN klink_whm_testing.dbo.MASTER_WAREHOUSE c ON a.ID_WAREHOUSE = c.ID_WAREHOUSE
      WHERE a.INITIATE_DO_ID = @initiateId`, (err, result) => {
        if (err) throw err
        res.json(result.recordset)
      })
    })
}

exports.getDetailProduct = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('initiateId', req.params.initiate_do_id)
    .query(`SELECT E.PRODUCT_CODE, E.PRODUCT_NAME, E.ID_PRODUCT, SUM(b.QTY_SISA) AS QTYDELIVERY
    FROM T_DETAIL_INITIATE_DO a
      LEFT join T_SALESSIMULATION b ON a.ID_KWITANSI=b.KWITANSI_NO
      LEFT join MASTER_PRODUK_ALIAS c ON b.PRODUK_ALIAS_ID=c.PRODUK_ALIAS_ID
      LEFT JOIN MASTER_PRODUK E ON E.ID_PRODUCT = c.ID_PRODUCT
    WHERE a.INITIATE_DO_ID = @initiateId AND b.QTY_SISA != 0 AND b.IS_INDENT != 1 AND B.IS_BUNDLED = 0
    GROUP BY E.PRODUCT_CODE, e.PRODUCT_NAME, E.ID_PRODUCT`, (err, result) => {
      if (err) throw err
      res.json(result.recordset) 
    })
  })
}

exports.getListIndent = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('initiateId', req.params.initiate_do_id)
    .query(`SELECT E.PRODUCT_CODE, E.PRODUCT_NAME, E.ID_PRODUCT,
      SUM(CASE
            WHEN c.IS_BUNDLE = 1 THEN b.QTY_SISA * D.QTY
            WHEN c.IS_BUNDLE = 0 THEN b.QTY_SISA
        END) AS QTYDELIVERY 
    FROM T_DETAIL_INITIATE_DO a
    LEFT JOIN T_SALESSIMULATION b ON a.ID_KWITANSI = b.KWITANSI_NO
    LEFT JOIN MASTER_PRODUK_ALIAS c ON b.PRODUK_ALIAS_ID = c.PRODUK_ALIAS_ID
    LEFT JOIN DETAIL_BUNDLE d ON B.PRODUK_ALIAS_ID = CASE
                            WHEN c.IS_BUNDLE = 1 THEN D.PRODUK_ALIAS_ID
                            END
    LEFT JOIN MASTER_PRODUK E ON E.ID_PRODUCT =	CASE
                        WHEN c.IS_BUNDLE = 1 THEN d.ID_PRODUCT
                        WHEN c.IS_BUNDLE = 0 THEN c.ID_PRODUCT
                        END
    WHERE a.INITIATE_DO_ID = @initiateId AND b.QTY_SISA != 0 AND b.IS_INDENT !=0
    GROUP BY E.PRODUCT_CODE, e.PRODUCT_NAME, E.ID_PRODUCT`, (err, result) => {
      if (err) throw err
      res.json(result.recordset) 
    })
  })
}

exports.getMasterProduct = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  pool_whm.then(pool => {
    pool.request()
    .input('productId', req.params.id_product)
    .query(`SELECT PRODUCT_NAME, PRODUCT_CODE, BOX FROM MASTER_PRODUK WHERE ID_PRODUCT = @productId`, (err, result) => {
      if (err) throw err
      res.json(result.recordset)
    })
  })

}