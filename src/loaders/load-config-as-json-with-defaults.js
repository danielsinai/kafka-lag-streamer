const PropertiesReader = require("properties-reader");
const { logLevel } = require("kafkajs");

const loadConfigAsJsonWithDefaults = ({ configPath }) => {
  const properties = PropertiesReader(configPath);


  const config = properties._properties;

  config["kafka.input.bootstrap.servers"] = (config["kafka.input.bootstrap.servers"] || "localhost:9092").split(",");
  config["kafka.input.consumer.group.name"] = config["kafka.input.consumer.group.name"] || "kafka.lag-streamer";
  config["kafka.input.consumer.offsets.topic.name"] = config["kafka.input.consumer.offsets.topic.name"] || "__consumer_offsets";
  config["kafka.input.bootstrap.servers.timeout.ms"] = config["kafka.input.bootstrap.servers.timeout.ms"] || 10000;
  config["kafka.input.partition.metadata.update.interval.ms"] = config["kafka.input.partition.metadata.update.interval.ms"] || 10000;

  config["kafka.output.bootstrap.servers"] = (config["kafka.output.bootstrap.servers"] || "localhost:9092").split(",");
  config["kafka.output.consumer.offsets.topic.name"] = config["kafka.output.consumer.lags.topic.name"] || "__consumer_offsets";
  config["kafka.output.bootstrap.servers.timeout.ms"] = config["kafka.output.bootstrap.servers.timeout.ms"] || 10000;
  config["kafka.output.enabled"] = config["kafka.output.enabled"] || true;

  config["kafkajs.logLevel"] = logLevel[config["kafkajs.logLevel"]] || logLevel["DEBUG"];

  return config;
};

module.exports = loadConfigAsJsonWithDefaults;

