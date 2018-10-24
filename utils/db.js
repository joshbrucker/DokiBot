const auth = require(__basedir + '/data/auth');
const mariadb = require('mariadb');

global.pool = mariadb.createPool({host: auth.dbHost, user: auth.dbUser, 
    password: auth.dbPass, database: auth.dbName, connectionLimit: 50});

var addGuild = async function(id, func) {
	let conn;
	try {
		conn = await pool.getConnection();

		var res = await conn.query(`INSERT INTO guild (id) VALUES (?)
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

var removeGuild = async function(id, func) {
	let conn;
	try {
		conn = await pool.getConnection();

		var res = await conn.query(`DELETE FROM guild WHERE id = ?;`, [id]);

		conn.end();
		if (func) {
			func();
		}
	} catch(err) {
		conn.end();
		throw err;
	}
};


var getGuild = async function(id, func) {
	/*
		guild = {
			id,
			prefix,
			poem_id,
			poem_frequency
		}
	*/

	let conn;
	try {
		conn = await pool.getConnection();

		var res = await conn.query(`SELECT * FROM guild WHERE id = ?;`, [id]);
		if (!res) {
			await conn.query(`INSERT INTO guild (id) VALUES (?);`, [id]);
			res = await conn.query(`SELECT * FROM guild WHERE id = ?;`, [id]);
		}

		conn.end();
		if (func) {
			func(res.pop());
		}
	} catch(err) {
		conn.end();
		throw err;
	}
}

var savePrefix = async function(id, prefix, func) {
	let conn;
	try {
		conn = await pool.getConnection();

		var res = await conn.query(`UPDATE guild SET prefix = ? WHERE id = ?;`, [prefix, id]);

		conn.end();
		if (func) {
			func();
		}
	} catch(err) {
		conn.end();
		throw err;
	}
};


var savePoemId = async function(id, pId, func) {
	let conn;
	try {
		conn = await pool.getConnection();

		var res = await conn.query(`UPDATE guild SET poem_id = ? WHERE id = ?;`, [pId, id]);

		conn.end();
		if (func) {
			func();
		}
	} catch(err) {
		conn.end();
		throw err;
	}
};

var savePoemFreq = async function(id, freq, func) {
	let conn;
	try {
		conn = await pool.getConnection();

		var res = await conn.query(`UPDATE guild SET poem_freq = ? WHERE id = ?;`, [freq, id]);

		conn.end();
		if (func) {
			func(res.pop());
		}
	} catch(err) {
		conn.end();
		throw err;
	}
};

module.exports = {
	addGuild,
	removeGuild,
	getGuild,
	savePrefix,
	savePoemFreq,
	savePoemId
};