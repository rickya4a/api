const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      routes = require('./routes');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
routes(app);

// start server and listen on port 5500
const server = app.listen(5500, function(){
  const port = server.address().port
  console.log("app listening at ", port);
});

