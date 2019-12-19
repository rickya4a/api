import express from 'express';
import { urlencoded, json } from 'body-parser';
import cors from 'cors';
import routes from './routes';
import "@babel/polyfill"
const app = express();

app.use(urlencoded({ extended: true}));
app.use(json());
app.use(cors());
app.options('*', cors());
routes(app);

// start server and listen on port 5500
const server = app.listen(5500, () => {
  const port = server.address().port
  console.log("app listening at ", port);
});

