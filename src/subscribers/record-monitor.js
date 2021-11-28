const constants = require("../constants");

class RecordMonitor {
  constructor({ kafkaOffsetConsumerService, recordDecoderService }) {
    this._kafkaOffsetConsumerService = kafkaOffsetConsumerService;
    this._recordDecoderService = recordDecoderService;

    this._translate = this._translate.bind(this);

    this._kafkaOffsetConsumerService.on(constants.events.RECEIVED_RECORD, this._translate);
  }

  _translate(record) {
    this._recordDecoderService.decode({ record });
  }
}

module.exports = RecordMonitor;