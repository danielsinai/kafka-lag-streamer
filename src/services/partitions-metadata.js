const NodeCache = require("node-cache");
const utils = require("../utils");
const _ = require("lodash");

class PartitionsMetadata {
  constructor({ kafkaAdmin, logger }) {
    this._kafkaAdmin = kafkaAdmin;
    this._cache = new NodeCache({ stdTTL: 10, checkperiod: 11 });
    this._logger = logger;
    this._pendingPromises = {};
  }

  async _fetchPartitionMetadata({ topic }) {
    try {
      if (!this._pendingPromises[topic]) {
        this._logger.info(`Creating a new fetch topic ${topic} partition offsets request`);
        this._pendingPromises[topic] = this._kafkaAdmin.fetchTopicOffsets(topic);
        return await this._pendingPromises[topic];
      }

      this._logger.info(`There is already a fetch topic ${topic} partitions offsets request in progress waiting for it to finish`);
      const resolved = await this._pendingPromises[topic];
      const { topic: currentResolvePromise, ...newPendingPromises } = this._pendingPromises;
      this._pendingPromises = newPendingPromises;

      return resolved;
    } catch (e) {
      this._logger.error(`Can not fetch partition offsets of ${topic}`)
      throw e;
    }

  }

  async get(data) {
    const cacheKey = utils.buildPartitionMetadataCacheKey(data);

    const isCached = this._cache.has(cacheKey);

    const partitionsMetadata = isCached ?
      this._cache.get(cacheKey) :
      await this._fetchPartitionMetadata(data);

    if (!isCached) {
      this._logger.info(`The topic ${data.topic} not in cache, updating it`);

      this._cache.set(cacheKey, partitionsMetadata);
    }

    return _.find(partitionsMetadata, ({ partition }) => partition === data.partition);
  }
}

module.exports = PartitionsMetadata;