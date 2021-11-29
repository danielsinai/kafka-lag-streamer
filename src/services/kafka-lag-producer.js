class KafkaLagProducer {
  constructor({ config, outputKafka }) {
    this._consumerLagsTopic = config['kafka.output.consumer.lags.topic.name'];
    this._producer = outputKafka.producer();
    this._isConnected = false;
    this._pendingPromise = null;
    this.send = this.send.bind(this);
  }

  async send({ group, lag, partition, originalOffset }) {
    if (!this._isConnected) {
      await this._producer.connect();
      this._isConnected = true;
    }

    // making sure producing in the received right order
    await this._pendingPromise;

    this._pendingPromise = await this._producer.send({
      topic: this._consumerLagsTopic,
      messages: [{ key: `${group}`, value: JSON.stringify({ group, lag, partition }) }],
    });
  }
}

module.exports = KafkaLagProducer;
