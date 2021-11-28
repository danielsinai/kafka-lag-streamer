const NodeCache = require("node-cache");
const utils = require("../utils");
const _ = require("lodash");

class PartitionsMetadata {
  constructor({ inputKafka }) {
    this._kafkaAdmin = inputKafka.admin();
    this._isKafkaAdminConnected = false;
    this._cache = new NodeCache({ stdTTL: 10, checkperiod: 11 });
    this._promises = {};
  }

  async get(data) {
    const cacheKey = utils.buildPartitionMetadataCacheKey(data);

    if (!this._isKafkaAdminConnected) {
      this._kafkaAdmin.connect();
      this._isKafkaAdminConnected = true;
    }

    let partitionsMetadata;
    const partitionsMetadataFromCache = this._cache.get(cacheKey);

    if (partitionsMetadataFromCache) {
      partitionsMetadata = partitionsMetadataFromCache;
    } else {
      if (this._promises[data.topic]) {
        const resolved = await this._promises[data.topic];
        delete this._promises[data.topic];
        partitionsMetadata = resolved;
      } else {
        this._promises[data.topic] = this._kafkaAdmin.fetchTopicOffsets(data.topic);
        partitionsMetadata = await this._promises[data.topic];
      }
    }

    if (!partitionsMetadataFromCache) this._cache.set(cacheKey, partitionsMetadata);

    return _.find(partitionsMetadata, ({ partition }) => partition === data.partition);
  }
}

module.exports = PartitionsMetadata;