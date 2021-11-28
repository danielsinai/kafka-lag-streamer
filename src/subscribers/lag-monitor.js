const constants = require("../constants");

class LagMonitor {
  constructor({ kafkaLagProducerService, offsetToLagCalculatorService, config }) {
    this._offsetToLagCalculatorService = offsetToLagCalculatorService;
    this._kafkaLagProducerService = kafkaLagProducerService;
    this._enabledOutput = config["kafka.output.enabled"];

    this._output = this._output.bind(this);

    this._offsetToLagCalculatorService.on(constants.events.NEW_LAG, this._output);
  }

  async _output(data) {
    if (this._enabledOutput === "true") {
      await this._kafkaLagProducerService.send(data);
    }
  }
}

module.exports = LagMonitor;