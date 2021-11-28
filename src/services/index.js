const KafkaOffsetConsumer = require("./kafka-offset-consumer");
const KafkaLagProducer = require("./kafka-lag-producer");
const RecordDecoder = require("./record-decoder");
const OffsetToLagCalculator = require("./offset-to-lag-calculator");

const services = {
  KafkaOffsetConsumer,
  KafkaLagProducer,
  RecordDecoder,
  OffsetToLagCalculator,
};

module.exports = services;