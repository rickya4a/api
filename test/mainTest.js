import { should as _should, use, request } from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/server';
const should = _should();
const server = app.listen();

use(chaiHttp);

describe('/GET all data', () => {
  it('should GET all data', done => {
    request(server).get('/').end((_err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('array');
      done();
    });
  });
});

describe('/GET stockists list', () => {
  it('should GET all stockist list', done => {
    request(server).get('/getListStk').end((_err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('array');
      done();
    });
  });
});

describe('/GET/:productid product data', () => {
  it('should GET product detail', done => {
    request(server)
    .get('/getMasterProduct/IDBJ01')
    .end((_err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('array');
      res.body.length.should.be.eql(1);
      res.should.have.nested.property('body[0].PRODUCT_CODE');
      res.should.have.nested.property('body[0].PRODUCT_NAME');
      res.should.have.nested.property('body[0].BOX');
      done();
    });
  });
});
