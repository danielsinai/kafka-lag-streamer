class KafkaLagProducer {
  constructor({ config, outputKafka }) {
    this._consumerLagsTopic = config["kafka.output.consumer.lags.topic.name"];
    this._producer = outputKafka.producer();
    this._isConnected = false;
    this._offsetCache = {}; // group-partition: offset

    this.send = this.send.bind(this);
  }

  async send({ group, lag, partition, originalOffset }) {
    const offsetCacheKey = group + "-" + partition;

    if (!this._isConnected) {
      await this._producer.connect();
      this._isConnected = true;
    }

    // making sure producing in the right order
    if (
      !this._offsetCache[offsetCacheKey] ||
      this._offsetCache[offsetCacheKey] < originalOffset
    ) {
      this._offsetCache[offsetCacheKey] = originalOffset;
      await this._producer.send({
          topic: this._consumerLagsTopic,
          messages: [
            { key: `${group}`, value: JSON.stringify({ group, lag, partition }) }
          ]
        }
      );
    }
  }
}

module.exports = KafkaLagProducer;