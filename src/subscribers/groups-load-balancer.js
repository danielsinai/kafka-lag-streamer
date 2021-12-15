const constants = require("../constants");

class GroupsLoadBalancer {
  constructor({
                kafkaOffsetConsumerService,
                loadBalancerResponsibilitiesExposerService,
                idleConsumerGroupsUpdaterService,
                recordDecoderService
              }) {
    this._kafkaOffsetConsumerService = kafkaOffsetConsumerService;
    this._loadBalancerResponsibilitiesExposerService = loadBalancerResponsibilitiesExposerService;
    this._idleConsumerGroupsUpdaterService = idleConsumerGroupsUpdaterService;
    this._recordDecoderService = recordDecoderService;

    this._resetResponsibilities = this._resetResponsibilities.bind(this);
    this._addResponsibility = this._addResponsibility.bind(this);
    this._updateResponsibility = this._updateResponsibility.bind(this);

    this._kafkaOffsetConsumerService.on(constants.events.INPUT_TOPIC_REBALANCED, this._resetResponsibilities);
    this._recordDecoderService.on(constants.events.COMMIT_OFFSET, this._addResponsibility);
    this._loadBalancerResponsibilitiesExposerService.on(constants.events.RESPONSIBILITY_EXPIRED, this._updateResponsibility);
  }

  _resetResponsibilities() {
    //TODO: add log
    this._loadBalancerResponsibilitiesExposerService.resetResponsibilities();
  }

  _addResponsibility(record) {
    //TODO: add responsibility log
    this._loadBalancerResponsibilitiesExposerService.upsertResponsibility(record);
  }

  async _updateResponsibility(value) {
    const newResponsibility = await this._idleConsumerGroupsUpdaterService.update(value);
    this._addResponsibility(newResponsibility);
  }
}

module.exports = GroupsLoadBalancer;