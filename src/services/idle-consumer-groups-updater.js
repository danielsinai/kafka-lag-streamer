const NodeCache = require("node-cache");
const { EventEmitter } = require("events");
const utils = require("../utils");

class IdleConsumerGroupsUpdater extends EventEmitter {
  constructor({ kafkaAdmin, offsetToLagCalculator }) {
    super();
    this._kafkaAdmin = kafkaAdmin;
    this._offsetToLagCalculator = offsetToLagCalculator;
    this._cache = new NodeCache({ stdTTL: 30, checkperiod: 11 });
  }

  async initGroupsCache() {
    const consumerGroups = await this._kafkaAdmin.listGroups();
    const consumerGroupsObj = consumerGroups.map((group) => )
  }

  addConsumerGroupsToCache() {

  }

  // When a consumer group is committing messages we dont want to retrieve information
  // about him again on expire
  postponeConsumerGroupSampling(keyModel) {
    //TODO: add warn log here about unused consumer groups
    const key = utils.buildConsumerGroupCacheKey(keyModel);

    this._cache.set(key, this._cache.get(key));
  };

  listenToExpiration() {
    this._cache.on("del", async (key, value) => {
      const groupInformation = await this._kafkaAdmin.fetchOffsets(key);

      await Promise.all(
        groupInformation.map(({ offset }) =>
          this._offsetToLagCalculator.calculate({
            offset,
            ...value
          })
        )
      );

      this._cache.set(key, value);
    });
  }
}

module.exports = IdleConsumerGroupsUpdater;