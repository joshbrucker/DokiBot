
const leftEmoji = "👈";
const rightEmoji = "👉";
const activePagings = {};

class PagingResponse {
  constructor(interaction, pageData, pagingTimeout) {
    this.interaction = interaction;
    this.pageData = pageData;
    this.pagingTimeout = pagingTimeout;
    this.pages = pageData.length;
    this.currentPage = 0;
    this.replyId = null;
    this.timeout = null;
  }

  static getLeftEmoji() {
    return leftEmoji;
  }

  static getRightEmoji() {
    return rightEmoji;
  }

  static getPagingEntries() {
    return activePagings;
  }

  static async handleReactEvent(reaction) {
    if (reaction.message.id in PagingResponse.getPagingEntries()) {
      if (reaction.emoji.toString() === PagingResponse.getRightEmoji()) {
        await PagingResponse.getPagingEntries()[reaction.message.id].nextPage();
      } else if (reaction.emoji.toString() === PagingResponse.getLeftEmoji()) {
        await PagingResponse.getPagingEntries()[reaction.message.id].prevPage();
      }
    }
  }

  async initialize() {
    await this.interaction.reply(this.pageData[0]);

    let reply = await this.interaction.fetchReply();
    this.replyId = reply.id;

    await reply.react(leftEmoji);
    await reply.react(rightEmoji);

    activePagings[this.replyId] = this;
    this.timeout = setTimeout(() => this.cancelPaging(), this.pagingTimeout);
  }

  async nextPage() {
    clearTimeout(this.timeout);
    this.currentPage = (this.currentPage + 1) % this.pages;
    await this.displayCurrentPage();
    this.timeout = setTimeout(() => this.cancelPaging(), this.pagingTimeout);
  }

  async prevPage() {
    clearTimeout(this.timeout);
    this.currentPage = (this.pages + (this.currentPage - 1)) % this.pages;
    await this.displayCurrentPage();
    this.timeout = setTimeout(() => this.cancelPaging(), this.pagingTimeout);
  }

  async displayCurrentPage() {
    await this.interaction.editReply(this.pageData[this.currentPage]);
  }

  cancelPaging() {
    clearTimeout(this.timeout);
    delete activePagings[this.replyId];
  }
}

module.exports = {
  PagingResponse
};