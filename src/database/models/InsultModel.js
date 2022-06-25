const { runQuery } = require("../db.js");

class InsultModel {
  constructor(id, status, message,memberId, upvotes, downvotes) {
    this.id = id;
    this.status = status;
    this.message = message;
    this.memberId = memberId;
    this.upvotes = upvotes;
    this.downvotes = downvotes;
  }

  async updateStatus(status) {
    this.status = status;
    await runQuery(`UPDATE insult SET status=? WHERE id=?`, [ status, this.id ]);
  }

  async addUpvotes(upvotes) {
    this.upvotes = upvotes;
    await runQuery(`UPDATE insult SET upvotes=upvotes+? WHERE id=?;`, [ upvotes, this.id ]);
  }

  async addDownvotes(downvotes) {
    this.downvotes = downvotes;
    await runQuery(`UPDATE insult SET downvotes=downvotes+? WHERE id=?;`, [ downvotes, this.id ]);
  }
}

module.exports = InsultModel;
