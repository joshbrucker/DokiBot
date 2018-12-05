const mariadb = require('mariadb');

const auth = require(__basedir + '/data/auth');
const utils = require(__basedir + '/utils/utils');

const pool = mariadb.createPool({host: auth.dbHost, user: auth.dbUser, 
    password: auth.dbPass, database: auth.dbName, connectionLimit: 50});

let guild = {
    verifyGuilds: async function(client, then) {
        let guilds = client.guilds;
        _query(async (conn) => {
            let res = await conn.query(`SELECT id FROM guild;`);
            await delete res['meta'];

            for (let i = 0; i < res.length; i++) {
                if (!guilds.get(res[i].id)) {
                    await conn.query(`DELETE FROM guild WHERE id = ?;`, [res[i].id]);
                }
            }
            return res;
        }, then);
    },

    // [{ id, prefix, poem_id, poem_frequency, insult_time }]
    getGuild: async function(id, then) {
        _query(async (conn) => {
            let res = await conn.query(`SELECT * FROM guild WHERE id = ?;`, [id]);
            if (!res || res.length == 0) {
                var date = utils.generateNewTime(new Date());
                await conn.query(`INSERT INTO guild (id, insult_time) VALUES (?, ?)
                                  ON DUPLICATE KEY UPDATE id=id;`, [id, date]);
                res = await conn.query(`SELECT * FROM guild WHERE id = ?;`, [id]);
            }

            await delete res['meta'];
            return res;
        }, then);
    },

    // [{ id }, { id }, ...]
    getInsultReadyGuilds: async function(date, then) {
        _query(async (conn) => {
            let res = await conn.query(`SELECT id FROM guild WHERE (insult_time <= ?) and (allow_insults);`, [date]);
            await delete res['meta'];
            return res;
        }, then);
    },

    addGuild: async function(id, then) {
        var date = utils.generateNewTime(new Date());
        _query(async (conn) => {
            let res = await conn.query(`INSERT INTO guild (id, insult_time) VALUES (?, ?)
                                        ON DUPLICATE KEY UPDATE id=id;`, [id, date]);
            return res;
        }, then);
    },

    removeGuild: async function(id, then) {
        _query(async (conn) => {
            let res = await conn.query(`DELETE FROM guild WHERE id = ?;`, [id]);
            return res;
        }, then);
    },

    // [{ allow_insults }]
    toggleInsults: async function(id, then) {
        _query(async (conn) => {
            await conn.query(`UPDATE guild SET allow_insults = not allow_insults WHERE id = ?;`, [id]);
            let res = await conn.query(`SELECT allow_insults FROM guild WHERE id = ?;`, [id]);
            await delete res['meta'];
            return res;
        }, then);
    },

    setInsultTime: async function(id, date, then) {
        _query(async (conn) => {
            let res = await conn.query(`UPDATE guild SET insult_time = ? WHERE id = ?;`, [date, id]);
            return res;
        }, then);
    },

    setPrefix: async function(id, prefix, then) {
        _query(async (conn) => {
            let res = await conn.query(`UPDATE guild SET prefix = ? WHERE id = ?;`, [prefix, id]);
            return res;
        }, then);
    },

    setPoemId: async function(id, pId, then) {
        _query(async (conn) => {
            let res = await conn.query(`UPDATE guild SET poem_id = ? WHERE id = ?;`, [pId, id]);
            return res;
        }, then);
    },

    setPoemFreq: async function(id, freq, then) {
        _query(async (conn) => {
            let res = await conn.query(`UPDATE guild SET poem_freq = ? WHERE id = ?;`, [freq, id]);
            return res;
        }, then);
    }
};

let member = {
    getMember: async function(id, then) {
        _query(async (conn) => {
            let res = await conn.query(`SELECT * FROM member WHERE id = ?;`, [id]);
            if (!res || res.length == 0) {
                await conn.query(`INSERT INTO member (id) VALUES (?)
                                  ON DUPLICATE KEY UPDATE id=id;`, [id]);
                res = await conn.query(`SELECT * FROM member WHERE id = ?;`, [id]);
            }

            await delete res['meta'];
            return res
        }, then);
    },

    addMember: async function(id, then) {
        _query(async (conn) => {
            let res = await conn.query(`INSERT INTO member (id) VALUES (?)
                                        ON DUPLICATE KEY UPDATE id=id;`, [id]);
            return res;
        }, then);
    },

    setSubmitCooldown: async function(id, date, then) {
        _query(async (conn) => {
            let res = await conn.query(`UPDATE member SET submit_cooldown = ? WHERE id = ?;`, [date, id]);
            return res;
        }, then);
    }
};

let insult = {
    addInsult: async function(message, user, then) {
        _query(async (conn) => {
            let res = await conn.query(`INSERT INTO insult (id, message, user) VALUES (UUID(), ?, ?);`, [message, user]);
            return res;
        }, then);
    },

    getInsults: async function(number, then) {
        _query(async (conn) => {
            let res = await conn.query(`SELECT * FROM insult
                                            JOIN (SELECT id FROM insult
                                                WHERE RAND() < (SELECT ((? / COUNT(*)) * 10)
                                                    FROM insult)
                                                ORDER BY RAND() LIMIT ?) AS z ON z.id = insult.id;`, [number, number]);
            await delete res['meta'];
            return res;
        }, then);
    }
};

let _query = async function(query, then) {
    let conn;
    try {
        conn = await pool.getConnection();
        let res = await query(conn);
        conn.end();
        if (then) {
            then(res);
        }
    } catch(err) {
        conn.end();
        throw err;
    }
};

module.exports = {
    guild,
    member,
    insult
};