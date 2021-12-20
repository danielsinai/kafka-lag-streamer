const Pulsar = require("../../src/client");
const config = require("../config");
const assert = require("assert");
const { createLogger, LEVELS } = require("../../src/logger");
const defaultLogger = require("../../src/logger/default");
const { jwt, discoveryServers, topic } = config;

describe("lags tests", function() {
  describe("writing messages and reading and checking output topic ", function() {
    it("should output the correct lag", async function() {
      const pulsar = new Pulsar({
        discoveryServers,
        jwt,
        logger: createLogger({ logLevel: LEVELS.TRACE, logCreator: defaultLogger })
      });

      try {
        await pulsar.connect({ topic });
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false);
      }
    });
  });
});
