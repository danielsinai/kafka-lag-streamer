class KafkaLagProducer {
  constructor({ config, outputKafka }) {
    this._consumerLagsTopic = config["kafka.output.consumer.lags.topic.name"];
    this._producer = outputKafka.producer();
    this._isConnected = false;

    this.send = this.send.bind(this);
  }

  async send({ group, lag, partition }) {
    if (!this._isConnected) {
      await this._producer.connect();
      this._isConnected = true;
    }

    // making sure producing in the right order
    await this._producer.send({
        topic: this._consumerLagsTopic,
        messages: [
          { key: `${group}`, value: JSON.stringify({ group, lag, partition }) }
        ]
      }
    );
  }
}

module.exports = KafkaLagProducer;