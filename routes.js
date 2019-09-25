module.exports = function(app){
  const controller = require('./controller');

  // DO190703012

  app.route('/')
    .get(controller.index);

  app.route('/tracking')
    .get(controller.tracking);

  app.route('/tracking/:NO_DO')
    .get(controller.getDetail);

  app.route('/inputTracking')
    .post(controller.insertData);

  app.route('/findTracking/:NO_DO')
    .get(controller.findTracking);

  app.route('/findCourier')
    .post(controller.findCourier);

  app.route('/getTrackingKnetStk/:trcd')
    .get(controller.getTrackingKnetStockis);
    
  app.route('/getTrackingKnetInv/:invoiceno')
    .get(controller.getTrackingKnetInv);

  app.route('/getDataCourier/:username')
    .get(controller.getDataCourier);
    
  app.route('/updatePassCourier')
    .put(controller.updatePassCourier);
}