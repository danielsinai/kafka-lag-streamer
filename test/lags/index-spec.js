const config = require("../config");
const assert = require("assert");
const { Kafka } = require('kafkajs')
import { v4 as uuidv4 } from 'uuid';

const { brokers, topicToTestLagsOn, group, consumerLagsTopic, groupMetadataTopic } = config;

describe("lags tests", function() {
  describe("live committing offset consumer group", function() {
    it("should fetch every x seconds idle consumer group lag to topic", async function() {
      const toProduce = uuidv4();
      const producer = (new Kafka({ brokers })).producer();
      const consumer1 = (new Kafka({ brokers })).consumer({ groupId: group });
      const consumer2 = (new Kafka({ brokers })).consumer({ groupId: group });

      try {
        await consumer1.connect();
        await consumer2.subscribe({ topic: consumerLagsTopic, fromBeginning: false})
        const promise = new Promise((resolve, reject) => {
          consumer2.run({ autoCommit: false, eachMessage: ({message}) => {
              console.log(JSON.parse(message.toString()))
            }
          });
        })
        await producer.connect();
        await producer.send({topic: topicToTestLagsOn, messages: [{key: null, value: toProduce}]});
        await consumer1.subscribe({ topic: topicToTestLagsOn, fromBeginning: false})
        consumer1.run({ eachMessage: ({resolveOffset, message}) => {
            message.value.toString() === toProduce && resolveOffset()
          }
        }).then(() => console.log('running'));
        await promise;
        await consumer2.disconnect();
        await consumer1.disconnect();
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false);
      }
    });
  });
  describe("idle consumer groups", function() {
    it("should fetch every x seconds idle consumer group lag to topic", async function() {
      const toProduce = uuidv4();
      const producer = (new Kafka({ brokers })).producer();
      const consumer = (new Kafka({ brokers })).consumer({ groupId: group });

      try {
        await consumer.connect()
        await consumer.subscribe({ topic: consumerLagsTopic, fromBeginning: false})
        const promise = new Promise((resolve, reject) => {
          consumer.run({ autoCommit: false, eachMessage: ({message}) => {
            setTimeout(reject, 20000)
            JSON.parse((message.value).toString()).group === consumerLagsTopic && resolve();
          }
          });
        })
        await producer.connect();
        await producer.send({topic: topicToTestLagsOn, messages: [{key: null, value: toProduce}]});
        await promise;
        await consumer.disconnect();
        assert.ok(true);
      } catch (e) {
        console.log(e);
        assert.ok(false);
      }
    });
  });
});
