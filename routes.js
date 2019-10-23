module.exports = function(app){
  // import controller di sini
  const tracking = require('./controller/tracking');
  const pineapple = require('./controller/importPineapple');


  // route untuk api tracking
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

  // routes pineapple
  app.route('/selectDate')
    .get(pineapple.selectDate);

  app.route('/bbhdr')
    .get(pineapple.bbhdr);
}