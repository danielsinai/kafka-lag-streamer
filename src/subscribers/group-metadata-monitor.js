const constants = require("../constants");

class GroupMetadataMonitor {
  constructor({ kafkaGroupMetadataProducerService, recordDecoderService, config, logger }) {
    this._recordDecoderService = recordDecoderService;
    this._kafkaGroupMetadataProducer = kafkaGroupMetadataProducerService;
    this._enabledOutput = config["kafka.output.group.metadata.enabled"];
    this._logger = logger;

    this._output = this._output.bind(this);

    this._recordDecoderService.on(constants.events.GROUP_METADATA, this._output);
  }

  async _output(data) {
    if (this._enabledOutput === "true") {
      this._logger.trace(`Founded metadata producing to output topic ${JSON.stringify(data)}`);

      await this._kafkaGroupMetadataProducer.send(data);
    }
  }

}

module.exports = GroupMetadataMonitor;