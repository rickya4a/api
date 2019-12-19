import { pool_ecommerce } from '../config/db_config';
import { PreparedStatement, VarChar, DateTime } from 'mssql';

export async function jatisMessage(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const ps = new PreparedStatement(await pool_ecommerce);
  ps.input('userid', VarChar)
  .input('password', VarChar)
  .input('sender', VarChar)
  .input('messageId', VarChar)
  .input('deliverystatus', VarChar)
  .input('datehit', DateTime)
  .input('datereceived', DateTime)
  .prepare(`SELECT orderno
  FROM db_ecommerce.dbo.ecomm_trans_hdr_sgo a
  WHERE a.wa_sent_remark = @messageId`, err => {
    if (err) throw err;
    ps.execute({ messageId: req.query.messageId }, (err, result) => {
      if (err) {
        throw err;
      } else if (!result.recordset) {
        res.status(204).json({ values: null, message: 'Data not found' })
      } else {
        pool_mlm.then(pool => {
          pool.request()
          .input('orderno', result.recordset[0].orderno)
          .input('messageId', req.query.messageId)
          .input('deliverystatus', req.query.deliverystatus)
          .input('datehit', req.query.datehit)
          .input('datereceived', req.query.datereceived)
          .query(`INSERT INTO db_ecommerce.dbo.ecomm_wa_cod_confirm (
            orderno, messageId, deliverystatus, datehit, datereceived)
          VALUES (
            @orderno, @messageId, @deliverystatus, @datehit, @datereceived)`,
          (err, result) => {
            if (err) {
              throw err;
            } else if (!result) {
              res.status(500).send({ message: 'Whoops! Something went wrong' })
            }
            res.status(200);
          })
        })
      }
      return ps.unprepare();
    })
  })
}