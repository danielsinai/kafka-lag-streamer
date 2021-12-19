const constants = require("../constants");

class LagMonitor {
  constructor({ kafkaLagProducerService, offsetToLagCalculatorService, logger, config }) {
    this._offsetToLagCalculatorService = offsetToLagCalculatorService;
    this._kafkaLagProducerService = kafkaLagProducerService;
    this._enabledOutput = config["kafka.output.consumer.lags.enabled"];
    this._logger = logger;

    this._output = this._output.bind(this);

    this._offsetToLagCalculatorService.on(constants.events.NEW_LAG, this._output);
  }

  async _output(data) {
    if (this._enabledOutput === "true") {
      this._logger.trace(`Lag founded starting produce process now ${JSON.stringify(data)}`);

      await this._kafkaLagProducerService.send(data);
    }
  }
}

module.exports = LagMonitor;