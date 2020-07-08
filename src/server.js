import express from 'express';
import { urlencoded, json } from 'body-parser';
import cors from 'cors';
import routes from './routes';
import serveIndex from 'serve-index';
import "@babel/polyfill";
const app = express();

if (process.env.NODE_ENV === 'test') process.env.SERVER_PORT=4567

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors());
app.use('/.well-known',
  express.static('.well-known'),
  serveIndex('.well-known')
);
app.options('*', cors());
routes(app);

// start server and listen on port 5500
const server = app.listen(process.env.SERVER_PORT, () => {
  const port = server.address().port
  console.log("app listening at ", port);
});

export default app;