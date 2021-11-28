const loaders = require("./loaders/index.js");
const path = require("path");

const [, , configPathInput] = process.argv;
const configPath = configPathInput || path.join(__dirname, `..`, `config`, `lag-streamer.yaml`);

const config = loaders.loadConfigAsJsonWithDefaults({ configPath });
const container = loaders.loadContainer({ config });
loaders.loadSubscribers(container);

(async () => {
  const kafkaOffsetConsumerService = container.resolve("kafkaOffsetConsumerService");
  kafkaOffsetConsumerService.run();
})();