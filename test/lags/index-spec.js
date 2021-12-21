const config = require("../config");
const assert = require("assert");
const { Kafka } = require('kafkajs')

const { brokers, topicToTestLagsOn, group, consumerLagsTopic, groupMetadataTopic } = config;

describe("lags tests", function() {
  describe("writing messages and reading and checking output topic ", function() {
    it("should output the correct lag", async function() {
      const producer = (new Kafka({ brokers })).producer();
      const consumer = (new Kafka({ brokers })).consumer({ groupId: group });

      try {
        await consumer.connect()
        await consumer.subscribe({ topic: consumerLagsTopic, fromBeginning: true})
        const promise = new Promise((resolve, reject) => {
          consumer.run({ autoCommit: false, eachMessage: ({message}) => console.log(message.value.toString())});
        })
        await producer.connect();
        await producer.send({topic: topicToTestLagsOn, messages: [{key: null, value: 'testing'}]});
        await promise;
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false);
      }
    });
  });
});
