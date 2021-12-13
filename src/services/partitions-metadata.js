const NodeCache = require("node-cache");
const utils = require("../utils");
const _ = require("lodash");

class PartitionsMetadata {
  constructor({ kafkaAdmin }) {
    this._kafkaAdmin = kafkaAdmin;
    this._cache = new NodeCache({ stdTTL: 10, checkperiod: 11 });
    this._pendingPromises = {};
  }

  async _fetchPartitionMetadata({ topic }) {
    if (!this._pendingPromises[topic]) {
      this._pendingPromises[topic] = this._kafkaAdmin.fetchTopicOffsets(topic);
      return await this._pendingPromises[topic];
    }

    const resolved = await this._pendingPromises[topic];
    const { topic: currentResolvePromise, ...newPendingPromises } = this._pendingPromises;
    this._pendingPromises = newPendingPromises;

    return resolved;
  }

  async get(data) {
    const cacheKey = utils.buildPartitionMetadataCacheKey(data);

    const isCached = this._cache.has(cacheKey);

    const partitionsMetadata = isCached ?
      this._cache.get(cacheKey) :
      await this._fetchPartitionMetadata(data);

    if (!isCached) this._cache.set(cacheKey, partitionsMetadata);

    return _.find(partitionsMetadata, ({ partition }) => partition === data.partition);
  }
}

module.exports = PartitionsMetadata;