const constants = require("../constants");

class GroupsLoadBalancer {
  constructor({
                kafkaOffsetConsumerService,
                loadBalancerResponsibilitiesExposerService,
                idleConsumerGroupsUpdaterService,
                recordDecoderService,
                logger
              }) {
    this._kafkaOffsetConsumerService = kafkaOffsetConsumerService;
    this._loadBalancerResponsibilitiesExposerService = loadBalancerResponsibilitiesExposerService;
    this._idleConsumerGroupsUpdaterService = idleConsumerGroupsUpdaterService;
    this._recordDecoderService = recordDecoderService;
    this._logger = logger;

    this._resetResponsibilities = this._resetResponsibilities.bind(this);
    this._takeOrPostponeResponsibility = this._takeOrPostponeResponsibility.bind(this);
    this._updateResponsibility = this._updateResponsibility.bind(this);

    this._kafkaOffsetConsumerService.on(constants.events.INPUT_TOPIC_REBALANCED, this._resetResponsibilities);
    this._recordDecoderService.on(constants.events.COMMIT_OFFSET, this._takeOrPostponeResponsibility);
    this._loadBalancerResponsibilitiesExposerService.on(constants.events.RESPONSIBILITY_EXPIRED, this._updateResponsibility);
  }

  _resetResponsibilities() {
    this._logger.warn(`A new instance of lag streamer joined, resetting responsibilities - 
    **this log can be ignored if you are aware of a new instance or this instance is just strated`);

    this._loadBalancerResponsibilitiesExposerService.resetResponsibilities();
  }

  _takeOrPostponeResponsibility(record) {
    this._loadBalancerResponsibilitiesExposerService.takeOrPostponeResponsibility(record);
  }

  async _updateResponsibility(value) {
    this._logger.info(`Idle consumer group ${value.group} lag is being updated`);

    await this._idleConsumerGroupsUpdaterService.update(value);
  }
}

module.exports = GroupsLoadBalancer;