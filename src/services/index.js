const KafkaOffsetConsumer = require("./kafka-offset-consumer");
const KafkaLagProducer = require("./kafka-lag-producer");
const RecordDecoder = require("./record-decoder");
const OffsetToLagCalculator = require("./offset-to-lag-calculator");
const PartitionsMetadata = require("./partitions-metadata");

const services = {
  KafkaOffsetConsumer,
  KafkaLagProducer,
  RecordDecoder,
  OffsetToLagCalculator,
  PartitionsMetadata,
};

module.exports = services;