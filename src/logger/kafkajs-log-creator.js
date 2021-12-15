const { logLevel } = require("kafkajs");
const kafkaJsLogCreator = (logger) => () => ({ namespace, level, label, log }) => {
  const getLevel = () => {
    switch (level) {
      case logLevel.ERROR:
      case logLevel.NOTHING:
        return "error";
      case logLevel.WARN:
        return "warn";
      case logLevel.INFO:
        return "info";
      case logLevel.DEBUG:
        return "debug";
    }
  };
  const { message, ...others } = log;
  logger[getLevel()](`${label} [kafkajs - ${namespace}] ${message} ${JSON.stringify(others)}`);
};

module.exports = kafkaJsLogCreator;