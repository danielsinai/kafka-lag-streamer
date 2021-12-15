const constants = require("../constants");

class CommitOffsetMonitor {
  constructor({ offsetToLagCalculatorService, recordDecoderService, logger }) {
    this._recordDecoderService = recordDecoderService;
    this._offsetToLagCalculatorService = offsetToLagCalculatorService;
    this._logger = logger;

    this._calculateLag = this._calculateLag.bind(this);

    this._recordDecoderService.on(constants.events.COMMIT_OFFSET, this._calculateLag);
  }

  async _calculateLag(commitOffset) {
    this._logger.trace(`Offset have been committed - ${JSON.stringify(commitOffset)}`);

    await this._offsetToLagCalculatorService.calculate({ commitOffset });
  }
}

module.exports = CommitOffsetMonitor;