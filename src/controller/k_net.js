import { pool_ecommerce } from '../config/db_config';
import { PreparedStatement, VarChar, DateTime } from 'mssql';
import bcrypt from 'bcrypt';
import { Base64 } from "js-base64";

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
            @orderno, @messageId, @deliverystatus,
            @datehit, @datereceived)`, (err, result) => {
            if (err) {
              throw err;
            } else if (!result) {
              res.status(500).send({
                message: 'Whoops! Something went wrong'
              });
            }
            res.status(200);
          })
        })
      }
      return ps.unprepare();
    })
  })
}

// Dev only
/**
 * Assume inputEncrypted as registerMember
 * and compareEncrypted as login
 *
 * @inputEcrypted
 * User input their plain password. Salt
 * and hash user password input and store it to DB
 *
 * @compareEncrypted
 * User input their plain password. Compare
 * the input and return boolean value.
 * If it's matched return true and vice-versa
 */
export async function inputEncrypted(req, res) {
  bcrypt.genSalt(12, (err, salt) => {
    if (err) return err
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      let encoded = Base64.encode(hash)
      res.json(encoded)
    })
  })
}

export async function compareEncrypted(req, res) {
  const match = await bcrypt.compare(
    req.body.password,
    Base64.decode(req.body.hash)
  )
  Object.entries().length === 0
  if (match) {
    res.send(match)
  }
}