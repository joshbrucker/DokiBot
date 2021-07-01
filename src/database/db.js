const mariadb = require('mariadb');

const auth = require(__basedir + '/auth.json');
const utils = require(__basedir + '/utils.js');

const pool = mariadb.createPool({host: auth.dbHost, user: auth.dbUser, 
  password: auth.dbPass, database: auth.dbName, connectionLimit: 50});

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
    try {
      conn = await pool.getConnection();
      let response = await conn.query(`SELECT * FROM guild WHERE id = ?;`,
                                      [ id ]);
      delete response['meta'];

      if (!response || response.length == 0) {
        let date = utils.generateNewTime(new Date());
        response = await conn.query(`INSERT INTO guild (id, insult_time) VALUES (?, ?)
                                    ON DUPLICATE KEY UPDATE id=id;`,
                                    [ id, date ]);
        response = await conn.query(`SELECT * FROM guild WHERE id = ?;`,
                                    [ id ]);
        delete response['meta'];
      }

      return response[0];
    } catch(err) {
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },

  addGuild: async function(id) {
    let conn;
    try {
      conn = await pool.getConnection();
      let date = utils.generateNewTime(new Date());
      return await conn.query(`INSERT INTO guild (id, insult_time) VALUES (?, ?)
                              ON DUPLICATE KEY UPDATE id=id;`,
                              [id, date]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  removeGuild: async function(id) {
    return await conn.query(`DELETE FROM guild WHERE id = ?;`,
                            [ id ]);
  },

  toggleInsults: async function(id) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`UPDATE guild SET allow_insults = not allow_insults WHERE id = ?;`,
                              [ id ]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  setDefaultChannel: async function(id, channelId) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`UPDATE guild SET default_channel = ? WHERE id = ?;`,
                              [channelId, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  setInsultTime: async function(id, date) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`UPDATE guild SET insult_time = ? WHERE id = ?;`, [date, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  setPrefix: async function(id, prefix) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`UPDATE guild SET prefix = ? WHERE id = ?;`, [prefix, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  setPoemId: async function(id, poemId) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`UPDATE guild SET poem_id = ? WHERE id = ?;`, [poemId, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  setPoemFreq: async function(id, freq) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`UPDATE guild SET poem_freq = ? WHERE id = ?;`, [freq, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
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
    try {
      conn = await pool.getConnection();
      let response = await conn.query(`SELECT * FROM member WHERE id = ?;`,
                                      [ id ]);
      delete response['meta'];

      if (!response || response.length == 0) {
        await conn.query(`INSERT INTO member (id) VALUES (?)
                         ON DUPLICATE KEY UPDATE id=id;`,
                         [ id ]);
        response = await conn.query(`SELECT * FROM member WHERE id = ?;`,
                                    [ id ]);
        delete response['meta'];
      }

      return response[0];
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  addMember: async function(id, then) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM member WHERE id = ?;`,
                              [ id ]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  setSubmitCooldown: async function(id, date, then) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`UPDATE member SET submit_cooldown = ? WHERE id = ?;`,
                              [date, id]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  }
};

let insult = {
  addInsult: async function(message, user, then) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`INSERT INTO insult (id, message, user) VALUES (UUID(), ?, ?);`,
                              [message, user]);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  },

  getInsults: async function(then) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM insult
                              ORDER BY RAND()
                              LIMIT 1;`);
    } catch(err) {
      throw err
    } finally {
      if (conn) conn.end();
    }
  }
};

module.exports = {
  guild,
  member,
  insult
};