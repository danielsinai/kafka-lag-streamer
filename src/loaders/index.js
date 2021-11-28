const loadContainer = require("./load-container");
const loadConfigAsJsonWithDefaults = require("./load-config-as-json-with-defaults");
const loadSubscribers = require("./load-subsribers");

const loaders = {
  loadConfigAsJsonWithDefaults,
  loadContainer,
  loadSubscribers,
};

module.exports = loaders;