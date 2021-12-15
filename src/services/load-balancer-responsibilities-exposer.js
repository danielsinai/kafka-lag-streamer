const _ = require("lodash");
const utils = require("../utils");
const NodeCache = require("node-cache");
const constants = require("../constants");
const { EventEmitter } = require("events");

class LoadBalancerResponsibilitiesExposer extends EventEmitter {
  constructor({ logger }) {
    super();
    this._logger = logger;
    this.resetResponsibilities();
  }

  upsertResponsibility(responsibilityPayload) {
    const key = utils.buildResponsibilityKey(responsibilityPayload);

    if (!this._responsiblites.has(key)) {
      this._logger.info(`This lag-streamer instance is taking responsibility on ${responsibilityPayload.group} ${responsibilityPayload.topic} ${responsibilityPayload.partition}`);

      this._responsiblites.set(utils.buildResponsibilityKey(responsibilityPayload), responsibilityPayload);
    }
  }

  resetResponsibilities() {
    this._responsiblites && this._responsiblites.removeAllListeners();

    this._responsiblites = new NodeCache({
      stdTTL: 10,
      deleteOnExpire: false,
      checkperiod: 11
    });
    this._responsiblites.on("expire", (k, v) => {
      this.emit(constants.events.RESPONSIBILITY_EXPIRED, v);
    });
  }
}

module.exports = LoadBalancerResponsibilitiesExposer;