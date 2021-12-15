class KafkaLagProducer {
  constructor({ config, outputKafka, logger }) {
    this._consumerLagsTopic = config["kafka.output.consumer.lags.topic.name"];
    this._producer = outputKafka.producer();
    this._isConnected = false;
    this._logger = logger;
    this.send = this.send.bind(this);
  }

  async send({ group, lag, topic, partition }) {
    if (!this._isConnected) {
      await this._producer.connect();
      this._isConnected = true;
    }

    try {
      await this._producer.send({
          topic: this._consumerLagsTopic,
          messages: [
            { key: `${group}${topic}${partition}`, value: JSON.stringify({ group, topic, partition, lag }) }
          ]
        }
      );
    } catch (e) {
      this._logger.error(`Could not produce lags to topic ${this._consumerLagsTopic} because of ${e.message}`)
    }
  }
}

module.exports = KafkaLagProducer;