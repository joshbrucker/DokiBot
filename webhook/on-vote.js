const db = require(__basedir + '/utils/db');

let onVote = function(vote) {
    let id = vote.user;

    let date = new Date();
    db.member.getMember(id, (member) => {
        if (member.submit_cooldown == null || member.submit_cooldown <= date) {
            return;
        }

        db.member.setSubmitCooldown(id, null);
    });
};

module.exports = onVote;