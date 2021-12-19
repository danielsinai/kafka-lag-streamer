const PropertiesReader = require("properties-reader");
const { logLevel } = require('kafkajs');

const loadConfigAsJsonWithDefaults = ({ configPath }) => {
  const properties = PropertiesReader(configPath);


  const config = properties._properties;

  config["kafka.input.bootstrap.servers"] = (config["kafka.input.bootstrap.servers"] || "localhost:9092").split(",");
  config["kafka.input.consumer.group.name"] = config["kafka.input.consumer.group.name"] || 'kafka.lag-streamer';
  config["kafka.input.consumer.offsets.topic.name"] = config["kafka.input.consumer.offsets.topic.name"] || '__consumer_offsets'
  config["kafka.input.bootstrap.servers.timeout"] = config["kafka.input.bootstrap.servers.timeout"] || 10000

  config["kafka.output.consumer.lags.bootstrap.servers"] = (config["kafka.output.consumer.lags.bootstrap.servers"] || "localhost:9092").split(",");
  config["kafka.output.consumer.lags.topic.name"] = config["kafka.output.consumer.lags.topic.name"] || 'consumer.lags'
  config["kafka.output.consumer.lags.bootstrap.servers.timeout"] = config["kafka.output.consumer.lags.bootstrap.servers.timeout"] || 10000
  config["kafka.output.consumer.lags.enabled"] = config["kafka.output.consumer.lags.enabled"] || true

  config["kafka.output.group.metadata.bootstrap.servers"] = (config["kafka.output.group.metadata.bootstrap.servers"] || "localhost:9092").split(",");
  config["kafka.output.group.metadata.topic.name"] = config["kafka.output.group.metadata.topic.name"] || 'group.metadata'
  config["kafka.output.group.metadata.bootstrap.servers.timeout"] = config["kafka.output.group.metadata.bootstrap.servers.timeout"] || 10000
  config["kafka.output.group.metadata.enabled"] = config["kafka.output.group.metadata.enabled"] || true

  return config;
};

module.exports = loadConfigAsJsonWithDefaults;

