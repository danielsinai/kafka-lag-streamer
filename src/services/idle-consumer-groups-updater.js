const { EventEmitter } = require("events");
const _ = require("lodash");

class IdleConsumerGroupsUpdater extends EventEmitter {
  constructor({ kafkaAdmin, offsetToLagCalculatorService }) {
    super();
    this._kafkaAdmin = kafkaAdmin;
    this._offsetToLagCalculatorService = offsetToLagCalculatorService;
  }

  async update(payload) {
    const { group: groupId, topic } = payload;
    const offsetsPerPartition = await this._kafkaAdmin.fetchOffsets({ groupId, topic });
    const groupInformation = _.find(offsetsPerPartition, ({ partition }) => payload.partition === partition);

    await this._offsetToLagCalculatorService.calculate({
      commitOffset: {
        ...payload,
        offset: groupInformation.offset,
        partition: payload.partition
      }
    });

    return payload;
  }
}

module.exports = IdleConsumerGroupsUpdater;