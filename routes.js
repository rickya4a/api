export default (app) => {

  // ---- all controllers here ---- //
  const tracking = require('./controller/tracking');
  const pineapple = require('./controller/importPineapple');
  const initiateDO = require('./controller/initiateDO');
  // ---- end controllers here ---- //

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
    .get(tracking.stockies);

  app.route('/listDO')
    .post(tracking.listDO);

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

  app.route('/bbhdr')
    .get(pineapple.bbhdr);

  // route initiate DO
  app.route('/getDataHeader/:idstockies')
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

  // belum dites 
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

}