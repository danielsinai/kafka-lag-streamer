const NodeCache = require("node-cache");
const { EventEmitter } = require("events");
const utils = require("../utils");
const _ = require("lodash");

class IdleConsumerGroupsUpdater extends EventEmitter {
  constructor({ kafkaAdmin, offsetToLagCalculatorService }) {
    super();
    this._kafkaAdmin = kafkaAdmin;
    this._offsetToLagCalculatorService = offsetToLagCalculatorService;
    this._cache = new NodeCache({ stdTTL: 10, checkperiod: 11 });
  }

  async initGroupsCache() {
    const consumerGroups = await this._kafkaAdmin.listGroups();
    const topics = await this._kafkaAdmin.listTopics();

    // mapping all consumer group to topics that exists
    const consumerGroupsObj =
      await Promise.all(
        consumerGroups.groups.map(async ({ groupId }) => {
          return await Promise.all(
            topics.map(async topic => ({
              key: utils.buildConsumerGroupCacheKey({ group: groupId, topic }),
              val: {
                offset: await this._kafkaAdmin.fetchOffsets({ groupId, topic }),
                topic,
                group: groupId
              }
            })));
        })
      );

    this._cache.mset(_.flatten(consumerGroupsObj));
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
      const { group: groupId, topic } = value;
      const groupInformation = await this._kafkaAdmin.fetchOffsets({ groupId, topic });

      await Promise.all(
        groupInformation.map(({ offset, partition }) =>
          this._offsetToLagCalculatorService.calculate({
            commitOffset: {
              ...value,
              offset,
              partition
            }
          })
        )
      );

      this._cache.set(key, value);
    });
  }
}

module.exports = IdleConsumerGroupsUpdater;