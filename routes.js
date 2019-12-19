/**
 * Bring all controllers here
 */
import * as tracking from './controller/tracking';
import * as pineapple from './controller/importPineapple';
import * as initiateDO from './controller/initiateDO';
import * as createDO from './controller/createDO';
import * as k_net from './controller/k_net';

export default (app) => {

  // routes tracking
  app.route('/')
    .get(tracking.index);

  app.route('/tracking')
    .get(tracking.tracking);

  app.route('/tracking/:NO_DO')
    .get(tracking.getDetail);

  app.route('/inputTracking')
    .post(tracking.insertData);

  app.route('/findTracking/:NO_DO')
    .get(tracking.findTracking);

  app.route('/findCourier')
    .post(tracking.findCourier);

  app.route('/getTrackingKnetStk/:trcd')
    .get(tracking.getTrackingKnetStockis);

  app.route('/getTrackingKnetInv/:invoiceno')
    .get(tracking.getTrackingKnetInv);

  app.route('/getDataCourier/:username')
    .get(tracking.getDataCourier);

  app.route('/updatePassCourier')
    .put(tracking.updatePassCourier);

  app.route('/getListStk')
    .post(tracking.stockies);

  app.route('/listDO')
    .post(tracking.listDO);

  app.route('/getDoByDate')
    .post(tracking.getDoByDate);

  // routes pineapple
  app.route('/selectDate/:tglawal/:tglakhir')
    .get(pineapple.selectDate);

  app.route('/countDate/:tanggal')
    .get(pineapple.countDate);

  app.route('/selectKWByDate/:tanggal')
    .get(pineapple.selectKWByDate);

  app.route('/checkStkWms/:code_stockies')
    .get(pineapple.checkStkWms);

  app.route('/checkStkMssc/:loccd')
    .get(pineapple.checkStkMssc);

  app.route('/insertStkWms')
    .post(pineapple.insertStkWms);

  app.route('/countProdukAlias/:alias_code')
    .get(pineapple.countProdukAlias);

  app.route('/selectProdukAlias/:alias_code')
    .get(pineapple.selectProdukAlias);

  app.route('/insertKWStk')
    .post(pineapple.insertKWStk);

  app.route('/insertKWInv')
    .post(pineapple.insertKWInv);

  app.route('/getRePinaple/:tanggal')
    .get(pineapple.getRePinaple);

  // route initiate DO
  app.route('/getHeaderInitDO/:idstockies')
    .get(initiateDO.getDataHeader)

  app.route('/getListProductsKW/:kw')
    .get(initiateDO.getListProductsKW)

  app.route('/checkAliasProdSingle/:alias')
    .get(initiateDO.checkAliasProdSingle)


  app.route('/checkBoxProduct/:product')
    .get(initiateDO.checkBoxProduct)

  app.route('/checkAliasProdBundling/:bundle')
    .get(initiateDO.checkAliasProdBundling)

  app.route('/getDetailBundling/:bundle')
    .get(initiateDO.getDetailBundling)

  app.route('/checkProduct/:product')
    .get(initiateDO.checkProduct)

  app.route('/processKW/:kw')
    .get(initiateDO.processKW)

  app.route('/updateFlagProdBundling/:idsalessimulation')
    .get(initiateDO.updateFlagProdBundling)

  app.route('/processProdBundling/:alias')
    .get(initiateDO.processProdBundling)

  app.route('/searchProductCode/:idproduct')
    .get(initiateDO.searchProductCode)

  app.route('/searchAlias/:aliascode')
    .get(initiateDO.searchAlias)

  app.route('/checkDuplicateAlias/:kw/:alias')
    .get(initiateDO.checkDuplicateAlias)

  app.route('/updateQtyDuplicateAlias/:idsalessimulation/:qty')
    .get(initiateDO.updateQtyDuplicateAlias)

  app.route('/updateFlagKw/:kw')
    .get(initiateDO.updateFlagKw)

  // route create DO
  app.route('/getHeaderDO/:initiate_do_id')
    .get(createDO.getDataHeader)

  app.route('/getDetailProduct/:initiate_do_id')
    .get(createDO.getDetailProduct)

  app.route('/getListIndent/:initiate_do_id')
    .get(createDO.getListIndent)

  app.route('/getMasterProduct/:id_product')
    .get(createDO.getMasterProduct)

  app.route('/checkBox/:id_warehouse/:id_product')
    .get(createDO.checkBox)

  app.route('/checkPcs/:id_warehouse/:id_product')
    .get(createDO.checkPcs)

  app.route('/processReceiptNo/:initiate_do_id')
    .get(createDO.processReceiptNo)

  app.route('/processProductSingle/:kw')
    .get(createDO.processProductSingle)

  app.route('/checkStockProductBox/:id_warehouse/:id_product')
    .get(createDO.checkStockProductBox)

  app.route('/checkStockProductPcs/:id_warehouse/:id_product')
    .get(createDO.checkStockProductPcs)

  app.route('/checkProductIndent/:kw/:produk_alias_id')
    .get(createDO.checkProductIndent)

  app.route('/jatis-message')
  .get(k_net.jatisMessage)

}