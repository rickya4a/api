import _ from 'lodash';
import redis from 'redis';

const redisClient = redis.createClient(process.env.CACHE_PORT);

/**
 * Get result from DB
 * @param   {any}  params  error and query result
 * @return  {array}          Query result
 */
export function _getResult(...params) {
  if (params[0]) {
    throw params[0];
  } else if (_.isEmpty(params[1][params[2]])) {
    res.status(204).json({ values: null, message: 'Data not found' });
  } else {
    res.json(params[1][params[2]]);
  }
}

/**
 * Set cache data and get data from cache if data exist
 * @param   {string}  key    Cache key
 * @param   {Object}  value  Data to store to cache
 * @param   {object}  res    Response object
 * @return  {array}         Object data
 */
export function _cachedData(key, value, res) {
  redisClient.get(key, (error, data) => {
    if (error) res.status(500).send(err);
    if (data !== null) {
      res.status(200).send(JSON.parse(data));
    } else {
      redisClient.setex(key, 60, JSON.stringify(value));
      res.status(200).json(value);
    }
  })
}

/**
 * Set data and its expiration time
 * @param   {string}  key    Cache key
 * @param   {object}  value  Value to store
 * @return  {void}         Set data to cache
 */
export function _setData(key, value) {
  redisClient.setex(key, 60, JSON.stringify(value));
}

/**
 * Retrieve data from cache
 * @param   {object}  req   Request object
 * @param   {object}  res   Response object
 * @param   {function}  next   Next middleware thunk
 * @description    Use this function as route middleware
 */
export function _getData(req, res, next) {
  let key = req.route.path;

  redisClient.get(key, (error, data) => {
    if (error) res.status(400).send(err);
    if (data !== null) {
      return res.status(200).json(JSON.parse(data));
    } else {
      next();
    }
  })
}