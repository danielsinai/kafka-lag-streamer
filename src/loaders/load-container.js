const { createContainer, asClass, asValue, Lifetime } = require('awilix');
const services = require('../services');
const subscribers = require('../subscribers');
const { Kafka } = require('kafkajs');

const loadContainer = ({ config }) => {
  const container = createContainer({
    injectionMode: 'PROXY',
  });

  container.register({
    kafkaOffsetConsumerService: asClass(services.KafkaOffsetConsumer, {
      lifetime: Lifetime.SINGLETON,
    }),
    kafkaLagProducerService: asClass(services.KafkaLagProducer, { lifetime: Lifetime.SINGLETON }),
    recordDecoderService: asClass(services.RecordDecoder, { lifetime: Lifetime.SINGLETON }),
    offsetToLagCalculatorService: asClass(services.OffsetToLagCalculator, {
      lifetime: Lifetime.SINGLETON,
    }),
    partitionsMetadataService: asClass(services.PartitionsMetadata, {
      lifetime: Lifetime.SINGLETON,
    }),
    recordMonitorSubscriber: asClass(subscribers.RecordMonitor, { lifetime: Lifetime.SINGLETON }),
    commitOffsetMonitorSubscriber: asClass(subscribers.CommitOffsetMonitor, {
      lifetime: Lifetime.SINGLETON,
    }),
    lagMonitorSubscriber: asClass(subscribers.LagMonitor, { lifetime: Lifetime.SINGLETON }),
    // Using here asValue and not asClass because awilix cant handle unused config options
    inputKafka: asValue(
      new Kafka({
        brokers: config['kafka.input.bootstrap.servers'],
        connectionTimeout: config['kafka.input.bootstrap.servers.timeout.ms'],
        logLevel: config['kafkajs.logLevel'],
      })
    ),
    outputKafka: asValue(
      new Kafka({
        brokers: config['kafka.output.bootstrap.servers'],
        connectionTimeout: config['kafka.output.bootstrap.servers.timeout.ms'],
        logLevel: config['kafkajs.logLevel'],
      })
    ),
    config: asValue(config),
  });
  return container;
};

module.exports = loadContainer;
