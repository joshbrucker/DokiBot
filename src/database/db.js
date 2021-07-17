const mariadb = require('mariadb');

const auth = require(__basedir + '/auth.json');
const utils = require(__basedir + '/utils.js');

const pool = mariadb.createPool({host: auth.dbHost, user: auth.dbUser, 
  password: auth.dbPass, database: auth.dbName, connectionLimit: 30});

let guild = {
  /**
   * @return {
   *           id,
   *           prefix,
   *           poem_id,
   *           poem_frequency,
   *           default_channel,
   *           insult_time,
   *           allow_insults
   *         }
   */
  getGuild: async function(id) {
    let conn;
    let res
    try {
      conn = await pool.getConnection();
      res = await conn.query(`SELECT * FROM guild WHERE id = ?;`,
                            [ id ]);
      delete res['meta'];

      if (!res || res.length == 0) {
        let date = utils.generateNewTime(new Date());
        res = await conn.query(`INSERT INTO guild (id, insult_time) VALUES (?, ?)
                                    ON DUPLICATE KEY UPDATE id=id;`,
                                    [ id, date ]);
        res = await conn.query(`SELECT * FROM guild WHERE id = ?;`,
                                    [ id ]);
        delete res['meta'];
      }
    } catch(err) {
      throw err;
    } finally {
      if (conn) conn.end();
    }
    return res[0];
  },

  addGuild: async function(id) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      let date = utils.generateNewTime(new Date());
      res = await conn.query(`INSERT INTO guild (id, insult_time) VALUES (?, ?)
                             ON DUPLICATE KEY UPDATE id=id;`,
                             [id, date]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res[0];
  },

  removeGuild: async function(id) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      let date = utils.generateNewTime(new Date());
      res = await conn.query(`DELETE FROM guild WHERE id = ?;`,
                             [ id ]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }

    return res;
  },

  toggleInsults: async function(id) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`UPDATE guild SET allow_insults = not allow_insults WHERE id = ?;`,
                             [ id ]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res;
  },

  setDefaultChannel: async function(id, channelId) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = conn.query(`UPDATE guild SET default_channel = ? WHERE id = ?;`,
                       [channelId, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res[0];
  },

  setInsultTime: async function(id, date) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`UPDATE guild SET insult_time = ? WHERE id = ?;`,
                             [date, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res[0];
  },

  setPrefix: async function(id, prefix) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`UPDATE guild SET prefix = ? WHERE id = ?;`,
                             [prefix, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res[0];
  },

  setPoemId: async function(id, poemId) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`UPDATE guild SET poem_id = ? WHERE id = ?;`,
                             [poemId, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res[0];
  },

  setPoemFreq: async function(id, freq) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = conn.query(`UPDATE guild SET poem_freq = ? WHERE id = ?;`,
                       [freq, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res[0];
  }
};

let member = {
    /**
   * @return {
   *           id,
   *           submit_cooldown,
   *         }
   */
  getMember: async function(id) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`SELECT * FROM member WHERE id = ?;`,
                             [ id ]);
      delete res['meta'];

      if (!res || res.length == 0) {
        await conn.query(`INSERT INTO member (id) VALUES (?)
                         ON DUPLICATE KEY UPDATE id=id;`,
                         [ id ]);
        res = await conn.query(`SELECT * FROM member WHERE id = ?;`,
                                    [ id ]);
        delete res['meta'];
      }
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }

    return res[0];
  },

  addMember: async function(id) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`SELECT * FROM member WHERE id = ?;`,
                             [ id ]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res;
  },

  setSubmitCooldown: async function(id, date) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`UPDATE member SET submit_cooldown = ? WHERE id = ?;`,
                             [date, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res;
  }
};

let insult = {
  addInsult: async function(message, user, then) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`INSERT INTO insult (id, message, user) VALUES (UUID(), ?, ?);`,
                             [message, user]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res;
  },

  getInsults: async function(then) {
    let conn;
    let res;
    try {
      conn = await pool.getConnection();
      res = await conn.query(`SELECT * FROM insult
                              ORDER BY RAND()
                              LIMIT 1;`);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
    return res;
  }
};

module.exports = {
  guild,
  member,
  insult
};