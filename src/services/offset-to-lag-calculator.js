const _ = require('lodash');
const constants = require('../constants');
const { EventEmitter } = require('events');

class OffsetToLagCalculator extends EventEmitter {
  constructor({ inputKafka, partitionsMetadataService }) {
    super();
    this._kafkaAdmin = inputKafka.admin();
    // this object will assure we dont accidentally produce a latest offset of
    // the one already produce to prevent falsy lags
    this._partitionsMetadataService = partitionsMetadataService;
  }

  async calculate({ commitOffset }) {
    const partitionsMetadata = await this._partitionsMetadataService.get(commitOffset);
    const lag = partitionsMetadata.offset - commitOffset.offset;

    this.emit(constants.events.NEW_LAG, {
      group: commitOffset.group,
      topic: commitOffset.topic,
      partition: commitOffset.partition,
      originalOffset: commitOffset.originalOffset,
      lag,
    });
  }
}

module.exports = OffsetToLagCalculator;
