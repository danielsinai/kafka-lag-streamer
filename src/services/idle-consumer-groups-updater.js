const { EventEmitter } = require("events");
const _ = require("lodash");

class IdleConsumerGroupsUpdater extends EventEmitter {
  constructor({ kafkaAdmin, offsetToLagCalculatorService, logger }) {
    super();
    this._kafkaAdmin = kafkaAdmin;
    this._offsetToLagCalculatorService = offsetToLagCalculatorService;
    this._logger = logger;
  }

  async update(payload) {
    try {
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
    } catch (e) {
      this._logger.error(`Could not update idle consumer group because of ${e.message}`);
    }

  }
}

module.exports = IdleConsumerGroupsUpdater;