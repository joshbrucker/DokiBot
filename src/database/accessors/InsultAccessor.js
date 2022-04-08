const { v4 } = require('uuid');

const { runQuery } = require("../db.js");
const Insult = require(__basedir + "/structures/Insult.js");
const GlobalMemberAccessor = require("./GlobalMemberAccessor.js");

const InsultModel = {
  async getRandomAccepted() {
    let data = await runQuery(`SELECT * FROM insult WHERE status="accepted" ORDER BY RAND() LIMIT 1;`);
    
    if (data && data.length > 0) {
      return new Insult(data[0].id, data[0].status, data[0].message, data[0].member_id,
          data[0].upvotes, data[0].downvotes);
    }

    return null;
  },

  async getAllByMemberId(memberId, status="") {
    let data;
    if (!status) {
      data = await runQuery(`SELECT * FROM insult WHERE member_id=? ORDER BY last_updated DESC;`, [ memberId ]);
    } else {
      data = await runQuery(`SELECT * FROM insult WHERE status=? AND member_id=? ORDER BY last_updated DESC;`, [ status, memberId ]);
    }

    let processedResults = [];

    if (data) {
      for (let i = 0; i < data.length; i++) {
        processedResults.push(
          new Insult(data[i].id, data[i].status, data[i].message, data[i].member_id,
              data[i].upvotes, data[i].downvotes)
        );
      }
    }

    return processedResults;
  },

  async get(id) {
    let data = await runQuery(`SELECT * FROM insult WHERE id=?;`, [ id ]);

    if (data && data.length > 0) {
      return new Insult(data[0].id, data[0].status, data[0].message, data[0].member_id,
          data[0].upvotes, data[0].downvotes);
    }
  },

  async add(message, status, memberId) {
    // Make sure foreign key entries exist before adding, does nothing if already exist
    await GlobalMemberAccessor.add(memberId);

    let uuid = v4();
    await runQuery(`INSERT INTO insult (id, status, message, member_id) VALUES (?, ?, ?, ?);`, [ uuid, status, message, memberId ]);
    return this.get(uuid); // Creates two connections... can probably be optimized in the future.
  },

  async remove(messageId) {
    await runQuery(`DELETE FROM insult WHERE id=?;`, [ messageId ]);
  },
};

module.exports = InsultModel;
