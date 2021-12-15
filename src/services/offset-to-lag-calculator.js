const _ = require("lodash");
const constants = require("../constants");
const { EventEmitter } = require("events");

class OffsetToLagCalculator extends EventEmitter {
  constructor({ inputKafka, partitionsMetadataService }) {
    super();
    this._kafkaAdmin = inputKafka.admin();
    this._partitionsMetadataService = partitionsMetadataService;
  }

  async calculate({ commitOffset }) {
    const partitionsMetadata = await this._partitionsMetadataService.get(commitOffset);
    const isMarkedToReset = commitOffset.offset == -1 || commitOffset.offset == -2;
    const lag = !isMarkedToReset ? partitionsMetadata.offset - commitOffset.offset : commitOffset.offset;

    this.emit(constants.events.NEW_LAG, {
      group: commitOffset.group,
      topic: commitOffset.topic,
      partition: commitOffset.partition,
      lag
    });
  }
}

module.exports = OffsetToLagCalculator;