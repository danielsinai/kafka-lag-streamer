const _ = require("lodash");
const utils = require("../utils");
const NodeCache = require("node-cache");
const constants = require("../constants");
const { EventEmitter } = require("events");

class LoadBalancerResponsibilitiesExposer extends EventEmitter {
  constructor({ logger, config }) {
    super();
    this._logger = logger;
    this._updateIntervalMs = config["idle.group.update.interval.ms"];
    this._updateCheckIntervalMs = config["idle.group.update.check.period.ms"];
    this.resetResponsibilities();
  }

  takeOrPostponeResponsibility(responsibilityPayload) {
    const key = utils.buildResponsibilityKey(responsibilityPayload);

    if (!this._responsiblites.has(key)) {
      this._logger.info(`This lag-streamer instance is taking responsibility on ${responsibilityPayload.group} ${responsibilityPayload.topic} ${responsibilityPayload.partition}`);
      this._responsiblites.set(utils.buildResponsibilityKey(responsibilityPayload), responsibilityPayload);
    } else {
    }
  }

  resetResponsibilities() {
    this._responsiblites && this._responsiblites.removeAllListeners();

    this._responsiblites = new NodeCache({
      stdTTL: this._updateIntervalMs / 1000,
      checkperiod: this._updateCheckIntervalMs / 1000,
      deleteOnExpire: false
    });

    this._responsiblites.on("expired", (k, v) => {
      this.emit(constants.events.RESPONSIBILITY_EXPIRED, v);
    });
  }
}

module.exports = LoadBalancerResponsibilitiesExposer;