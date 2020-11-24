# import data ke table klink_whm_testing.dbo.T_SALESSIMULATION

- ambil data berdasarkan orderno LIKE 'EC%', data ini termasuk isi detail produk
queryDataSales = "SELECT a.orderno, b.idstk, a.whcd, b.id_memb , b.nmmember, a.addr1,
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
    from db_ecommerce.dbo.ecomm_trans_shipaddr_sgo a
    INNER JOIN db_ecommerce.dbo.ecomm_trans_hdr_sgo b ON a.orderno=b.orderno
    INNER JOIN db_ecommerce.dbo.ecomm_trans_det_prd_sgo c ON a.orderno=c.orderno
    LEFT OUTER JOIN db_ecommerce.dbo.master_prd_bundling d ON c.prdcd=d.cat_inv_id_parent
    where a.orderno = 'EC201167168597'"

## hasil queryDataSales

dataSales = {
	orderno: 'EC201167168597',
	idstk: 'IDBSS04',
	whcd: 'WH006',
	prdcd: 'IDHF004A',
	prdnm: 'K-KIDS',
	qty: 2
}

## compare dataSales ke table master WMS untuk penyesuaian data yang digunakan

- cek untuk kode whcd dulu ke table klink_whm_testing.dbo.MASTER_WAREHOUSE untuk ambil ID_WAREHOUSE
queryGetWarehouse = "SELECT ID_WAREHOUSE FROM MASTER_WAREHOUSE WHERE WAREHOUSE_CODE = 'WH006'"

- cari PRODUK_ALIAS_ID di table klink_whm_testing.dbo.MASTER_PRODUK_ALIAS
queryGetAlias = "SELECT PRODUK_ALIAS_ID FROM MASTER_PRODUK_ALIAS WHERE ALIAS_CODE = 'IDHF004A'"

ada kondisi di sini
if (empty(queryGetAlias) {
	throw message = "IDHF004A belum diset pada Master Produk Alias"
	break;
} else {
	bikin data baru untuk diinsert ke table klink_whm_testing.dbo.T_SALESSIMULATION

	importData = [
		'ID_SALESSIMULATION' => this->uuid->v4(),
		'ID_WAREHOUSE' => queryGetWarehouse->ID_WAREHOUSE,
		'ID_STOCKIES' => dataSales.idstk,
		'KWITANSI_NO' => dataSales.orderno,
		'PRODUK_ALIAS_ID' => queryGetAlias->PRODUK_ALIAS_ID,
		'QTY' => dataSales.qty,
		'CREATED_DATE' => date('Y-m-d'),
		'TRANSAKSI_DATE' => date('Y-m-d'),
		'IS_ACTIVE' => 0,
		'QTY_SEND' => 0,
		'QTY_SISA' => dataSales.qty,
		'IS_INDENT' => 0,
		'IS_BUNDLED' => 0,
		'TIPE' => 'KE' --kode untuk trx dari K-LINK EXPRESS, terserah mau dikasih inisial apa
	]

	- insert importData ke table klink_whm_testing.dbo.T_SALESSIMULATION

}

