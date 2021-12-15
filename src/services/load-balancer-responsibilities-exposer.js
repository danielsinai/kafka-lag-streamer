const _ = require("lodash");
const utils = require("../utils");
const NodeCache = require("node-cache");
const constants = require("../constants");
const { EventEmitter } = require("events");

class LoadBalancerResponsibilitiesExposer extends EventEmitter {
  constructor({}) {
    super();
    this.resetResponsibilities();
  }

  upsertResponsibility(responsibilityPayload) {
    this._responsiblites.set(utils.buildResponsibilityKey(responsibilityPayload), responsibilityPayload);
  }

  resetResponsibilities() {
    this._responsiblites && this._responsiblites.removeAllListeners();

    this._responsiblites = new NodeCache({ stdTTL: 10, checkperiod: 11 });
    this._responsiblites.on("del", (k, v) => console.log(k,v) || this.emit(constants.events.RESPONSIBILITY_EXPIRED, v));
  }
}

module.exports = LoadBalancerResponsibilitiesExposer;