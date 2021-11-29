const utils = require('../utils');
const _ = require('lodash');
const { EventEmitter } = require('events');

class PartitionsMetadata extends EventEmitter {
  constructor({ inputKafka, config }) {
    super();
    this._metadataUpdateInterval = config['kafka.input.partition.metadata.update.interval.ms'];
    this._kafkaAdmin = inputKafka.admin();
    this._isKafkaAdminConnected = false;
    this._pendingFetchMetadataRequest = {};
    this._partitionMetadataCache = {};

    this.init = this.init.bind(this);
    this._updateAllTopicsMetadata = this._updateAllTopicsMetadata.bind(this);
  }

  async init() {
    if (!this._isKafkaAdminConnected) {
      await this._kafkaAdmin.connect();
      this._isKafkaAdminConnected = true;

      setInterval(this._updateAllTopicsMetadata, this._metadataUpdateInterval);
      return;
    }
    console.warn('Initiating already initialized PartitionsMetadata'); // TODO: add warning here for trying to init twice
  }

  async _updatePartitionMetadata({ topic }) {
    const cacheKey = utils.buildPartitionMetadataCacheKey({ topic });

    // this logic is here in order to prevent spamming kafka with requests
    if (this._pendingFetchMetadataRequest[cacheKey])
      return await this._pendingFetchMetadataRequest[cacheKey];

    this._pendingFetchMetadataRequest[cacheKey] = this._kafkaAdmin.fetchTopicOffsets(topic);
    this._partitionMetadataCache[cacheKey] = await this._pendingFetchMetadataRequest[cacheKey];
  }

  async tryUpdatePartitionMetadata({ topic }) {
    const cacheKey = utils.buildPartitionMetadataCacheKey({ topic });

    if (!(cacheKey in this._partitionMetadataCache)) {
      await this._updatePartitionMetadata({ topic });
    }
  }

  async _updateAllTopicsMetadata() {
    const topicList = Object.keys(this._partitionMetadataCache);

    this._partitionMetadataCache = await topicList.reduce(
      async (cache, topic) => ({
        ...(await cache),
        [utils.buildPartitionMetadataCacheKey({ topic })]: await this._kafkaAdmin.fetchTopicOffsets(
          topic
        ),
      }),
      Promise.resolve({})
    );
  }

  async get(data) {
    const cacheKey = utils.buildPartitionMetadataCacheKey(data);
    await this.tryUpdatePartitionMetadata(data);

    return _.find(
      this._partitionMetadataCache[cacheKey],
      ({ partition }) => partition === data.partition
    );
  }
}

module.exports = PartitionsMetadata;
