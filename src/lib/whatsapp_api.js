/**
 * Whatsapp lib class
 */

import { pool_ecommerce } from '../config/db_config';
import { Request } from 'mssql';
import _ from 'lodash';
import "@babel/polyfill";

class WhatsappApi {

  constructor() {
    this.url = 'https://interactive.jatismobile.com'
    this.userid = "KLINKWA";
    this.password = "KLINKWA724";
    this.sender = "K-LINK_wa";
    this.division = "IT";
    this.klink_number = "628111989984";
    this.interactive_username = "klink";
    this.interactive_userpwd = "klink876$";
   }

   /**
    * Get latest token from database, if token has been expired
    * this delete expired token
    *
    * @return  {void|Promise}  return latest token
    */
  async getToken() {
    const pool = await pool_ecommerce;
    let getToken = pool.request().query(
      `SELECT
      token,
      CONVERT(VARCHAR, expire, 23) AS expire
      FROM whatsapp_token
      WHERE expire > GETDATE()`
    );
    if (_.isEmpty((await getToken).recordset)) {
      const transaction = pool.transaction();
      transaction.begin(err => {

        const request = new Request(transaction);
        const query = `DELETE FROM whatsapp_token WHERE expire <= GETDATE()`;

        // rolledback state
        let rolledBack = false;
        transaction.on('rollback', aborted => {
          rolledBack = true;
        });

        request.query(query, (err, result) => {
          if (err) {
            if (!rolledBack) {
              transaction.rollback(err => {
                JSON.stringify({ message: err });
              });
            }
          } else {
            transaction.commit(err => {
              if (result.rowsAffected > 0) {
                JSON.stringify({ message: 'Expired token' });
              }
            });
          }
        });
      });
      return transaction
    }
    return getToken
  }

  salamSehat(phoneNumber) {
    let components = [{
      type: 'header',
      parameters: [
        [
          {
            type: 'video',
            video: [
              { link: 'https://www.k-net.co.id/assets/salam_sehat.MP4' }
            ]
          }
        ]
      ]
    }];

    let mainData = [{
      to: phoneNumber,
      recipient_type: 'individual',
      type: 'template',
      template: [
        {
          namespace: '510bfb8a_5ea1_4c60_80bf_f8b7f3ce9168',
          language: [
            {
              policy: "deterministic",
              code: "id"
            }
          ],
          name: 'video_1',
          components: components
        }
      ]
    }];

    return mainData;
  }
}

export default WhatsappApi