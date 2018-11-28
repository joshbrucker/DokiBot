const mariadb = require('mariadb');

const auth = require(__basedir + '/data/auth');

global.pool = mariadb.createPool({host: auth.dbHost, user: auth.dbUser, 
    password: auth.dbPass, database: auth.dbName, connectionLimit: 50});

let verifyGuilds = async function(client, func) {
    let guilds = client.guilds;
    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`SELECT id FROM guild;`);
        await delete res['meta'];

        for (let i = 0; i < res.length; i++) {
            if (!guilds.get(res[i].id)) {
                await conn.query(`DELETE FROM guild WHERE id = ?;`, [res[i].id]);
            }
        }

        conn.end();
        if (func) {
            func();
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

let addGuild = async function(id, func) {
    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`INSERT INTO guild (id) VALUES (?)
                                    ON DUPLICATE KEY UPDATE id=id;`, [id]);

        conn.end();
        if (func) {
            func();
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

let removeGuild = async function(id, func) {
    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`DELETE FROM guild WHERE id = ?;`, [id]);

        conn.end();
        if (func) {
            func();
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

let getGuild = async function(id, func) {
    /*
        guild = {
            id,
            prefix,
            poem_id,
            poem_frequency,
            insult_time
        }
    */

    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`SELECT * FROM guild WHERE id = ?;`, [id]);
        if (!res || res.length == 0) {
            await conn.query(`INSERT INTO guild (id) VALUES (?)
                              ON DUPLICATE KEY UPDATE id=id;`, [id]);
            res = await conn.query(`SELECT * FROM guild WHERE id = ?;`, [id]);
        }

        await delete res['meta'];

        conn.end();
        if (func) {
            func(res[0]);
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

let getInsultGuildIds = async function(date, func) {
    /*
        guild = {
            id
        }
    */

    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`SELECT id FROM guild WHERE (insult_time <= ?);`, [date]);

        await delete res['meta'];

        conn.end();
        if (func) {
            func(res);
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

let setInsultTime = async function(id, date, func) {
    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`UPDATE guild SET insult_time = ? WHERE id = ?;`, [date, id]);

        conn.end();
        if (func) {
            func();
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

let savePrefix = async function(id, prefix, func) {
    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`UPDATE guild SET prefix = ? WHERE id = ?;`, [prefix, id]);

        conn.end();
        if (func) {
            func();
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};


let savePoemId = async function(id, pId, func) {
    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`UPDATE guild SET poem_id = ? WHERE id = ?;`, [pId, id]);

        conn.end();
        if (func) {
            func();
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

let savePoemFreq = async function(id, freq, func) {
    let conn;
    try {
        conn = await pool.getConnection();

        let res = await conn.query(`UPDATE guild SET poem_freq = ? WHERE id = ?;`, [freq, id]);

        conn.end();
        if (func) {
            func();
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

module.exports = {
    verifyGuilds,
    addGuild,
    removeGuild,
    getGuild,
    getInsultGuildIds,
    setInsultTime,
    savePrefix,
    savePoemFreq,
    savePoemId
};