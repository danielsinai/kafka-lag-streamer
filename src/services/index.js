const KafkaOffsetConsumer = require("./kafka-offset-consumer");
const KafkaLagProducer = require("./kafka-lag-producer");
const RecordDecoder = require("./record-decoder");
const OffsetToLagCalculator = require("./offset-to-lag-calculator");
const PartitionsMetadata = require("./partitions-metadata");
const IdleConsumerGroupsUpdater = require("./idle-consumer-groups-updater");

const services = {
  KafkaOffsetConsumer,
  KafkaLagProducer,
  RecordDecoder,
  OffsetToLagCalculator,
  PartitionsMetadata,
  IdleConsumerGroupsUpdater,
};

module.exports = services;