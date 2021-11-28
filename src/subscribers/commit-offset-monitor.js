const constants = require("../constants");

class CommitOffsetMonitor {
  constructor({ offsetToLagCalculatorService, recordDecoderService }) {
    this._recordDecoderService = recordDecoderService;
    this._offsetToLagCalculatorService = offsetToLagCalculatorService;

    this._calculateLag = this._calculateLag.bind(this);

    this._recordDecoderService.on(constants.events.COMMIT_OFFSET, this._calculateLag);
  }

  async _calculateLag(commitOffset) {
    await this._offsetToLagCalculatorService.calculate({ commitOffset });
  }
}

module.exports = CommitOffsetMonitor;