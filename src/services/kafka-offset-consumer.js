const EventEmitter = require("events");
const constants = require("../constants");

class KafkaOffsetConsumer extends EventEmitter {
  constructor({ config, inputKafka }) {
    super();
    this._kafka = inputKafka;
    this._consumerOffsetsTopic = config["kafka.input.consumer.offsets.topic.name"];
    this._groupId = config["kafka.input.consumer.group.name"];
  }

  async run() {
    const consumer = this._kafka.consumer({ groupId: this._groupId });

    consumer.on(
      consumer.events.GROUP_JOIN,
      (payload) => this.emit(constants.events.INPUT_TOPIC_REBALANCED, payload)
    );

    await consumer.connect();
    await consumer.subscribe({ topic: this._consumerOffsetsTopic, fromBeginning: true });
    await consumer.run({
      autoCommit: false,
      eachMessage: ({ message }) => this.emit(constants.events.RECEIVED_RECORD, message)
    });
  }
}

module.exports = KafkaOffsetConsumer;