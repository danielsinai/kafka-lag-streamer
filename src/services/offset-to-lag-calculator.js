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
    try {
      const partitionsMetadata = await this._partitionsMetadataService.get(commitOffset);
      const isMarkedToReset = commitOffset.offset == -1 || commitOffset.offset == -2;
      const lag = !isMarkedToReset ? partitionsMetadata.offset - commitOffset.offset : commitOffset.offset;

      this.emit(constants.events.NEW_LAG, {
        group: commitOffset.group,
        topic: commitOffset.topic,
        partition: commitOffset.partition,
        lag
      });
    } catch (e) {
      this._logger.error(`Could not calculate the offsets of the topic's partition of ${JSON.stringify(commitOffset)}, because ${e.message}`);
    }
  }
}

module.exports = OffsetToLagCalculator;