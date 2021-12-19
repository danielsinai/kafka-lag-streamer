class KafkaGroupMetadataProducer {
  constructor({ config, groupMetadataKafkaOutput, logger }) {
    this._consumerLagsTopic = config["kafka.output.group.metadata.topic.name"];
    this._producer = groupMetadataKafkaOutput.producer();
    this._isConnected = false;
    this._logger = logger;
    this.send = this.send.bind(this);
  }

  async send(data) {
    if (!this._isConnected) {
      await this._producer.connect();
      this._isConnected = true;
    }

    try {
      await this._producer.send({
          topic: this._consumerLagsTopic,
          messages: [
            { key: null, value: JSON.stringify(data) }
          ]
        }
      );
    } catch (e) {
      this._logger.error(`Could not produce lags to topic ${this._consumerLagsTopic} because of ${e.message}`)
    }
  }
}

module.exports = KafkaGroupMetadataProducer;
