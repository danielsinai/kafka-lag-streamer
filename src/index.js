const loaders = require("./loaders/index.js");
const path = require("path");

const [, , configPathInput] = process.argv;
const configPath = configPathInput || path.join(__dirname, `..`, `config`, `lag-streamer-local.yaml`);

(async () => {
  const config = loaders.loadConfigAsJsonWithDefaults({ configPath });
  const container = await loaders.loadContainer({ config });

  loaders.loadSubscribers(container);

  const kafkaOffsetConsumerService = container.resolve("kafkaOffsetConsumerService");
  kafkaOffsetConsumerService.run();
})();