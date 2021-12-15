const { configure, getLogger } = require("log4js");

const loggerConfig = (config) => ({
  appenders: {
    everything: {
      type: "dateFile",
      filename: config["kafka.lag.streamer.log.path"]
    },
    out: {
      type: "stdout"
    }
  },

  categories: {
    default: {
      appenders: ["everything", "out"],
      level: config["kafka.lag.streamer.log.level"]
    }
  }
});

module.exports = config => {
  configure(loggerConfig(config));
  return getLogger("kafka-lag-streamer");
};
