const loadContainer = require("./load-container");
const loadConfigAsJsonWithDefaults = require("./load-config-as-json-with-defaults");
const loadSubscribers = require("./load-subscribers");
const loadIdleConsumerGroupsUpdater = require("./load-idle-consumer-groups-updater");

const loaders = {
  loadConfigAsJsonWithDefaults,
  loadContainer,
  loadSubscribers,
  loadIdleConsumerGroupsUpdater,
};

module.exports = loaders;