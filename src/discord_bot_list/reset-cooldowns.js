const db = require(__basedir + '/database/db.js');

let resetCooldowns = function(vote) {
  const ID = vote.user;
  const DATE = new Date();

  db.member.getMember(ID, (member) => {
    member = member[0];
    if (member.submit_cooldown == null || member.submit_cooldown <= date) {
      return;
    }
    db.member.setSubmitCooldown(ID, null);
  });
};

module.exports = resetCooldowns;