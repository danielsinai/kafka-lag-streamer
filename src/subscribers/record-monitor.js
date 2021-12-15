const constants = require("../constants");

class RecordMonitor {
  constructor({ kafkaOffsetConsumerService, recordDecoderService, logger }) {
    this._kafkaOffsetConsumerService = kafkaOffsetConsumerService;
    this._recordDecoderService = recordDecoderService;
    this._logger = logger;

    this._translate = this._translate.bind(this);
    this._kafkaOffsetConsumerService.on(constants.events.RECEIVED_RECORD, this._translate);
  }

  _translate(record) {
    this._logger.trace(`Received message from input topic decoding it in order to determine it's type`);
    this._recordDecoderService.decode({ record });
  }
}

module.exports = RecordMonitor;