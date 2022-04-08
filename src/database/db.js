const mariadb = require("mariadb");

const auth = require(__basedir + "/auth.json");
const utils = require(__basedir + "/utils/utils.js");

const pool = mariadb.createPool({
  host: auth.dbHost,
  user: auth.dbUser, 
  password: auth.dbPass,
  database: auth.dbName,
  connectionLimit: 30
});

async function runQuery(queryString, queryVars=[]) {
  let conn;
  let res;

  try {
    conn = await pool.getConnection();
    res = await conn.query(queryString, queryVars);

    if (!res) res = [];
    if (res.meta) delete res.meta;
  } catch(err) {
    throw err;
  } finally {
    if (conn) await conn.end();
  }

  return res;
}

async function runReadOnlyQuery(queryString, queryVars=[]) {
  let conn;
  let res;

  try {
    conn = await pool.getConnection();
    await conn.changeUser({
      user: auth.dbUserReadOnly,
      password: auth.dbPassReadOnly
    });

    res = await conn.query(queryString, queryVars);

    if (!res) res = [];
    if (res.meta) delete res.meta;
  } catch(err) {
    throw err;
  } finally {
    if (conn) await conn.end();
  }

  return res;
}



module.exports = {
  runQuery,
  runReadOnlyQuery
};
