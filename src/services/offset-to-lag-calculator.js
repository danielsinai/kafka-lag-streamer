const _ = require("lodash");
const constants = require("../constants");
const { EventEmitter } = require("events");

class OffsetToLagCalculator extends EventEmitter {
  constructor({ inputKafka }) {
    super();
    this._kafkaAdmin = inputKafka.admin();
    this._isConnected = false;
  }

  async calculate({ commitOffset }) {
    //TODO: kafka admin logic will be in partitions metadata service
    !this._isConnected && this._kafkaAdmin.connect();
    this._isConnected = true;
    const partitionsMetadata = await this._kafkaAdmin.fetchTopicOffsets(commitOffset.topic);
    const currentPartitions = _.find(partitionsMetadata, ({ partition }) => partition === commitOffset.partition);
    const lag = currentPartitions.offset - commitOffset.offset;

    this.emit(constants.events.NEW_LAG, {
      group: commitOffset.group,
      topic: commitOffset.topic,
      partition: commitOffset.partition,
      originalOffset: commitOffset.originalOffset,
      lag
    });


  }
}

module.exports = OffsetToLagCalculator;