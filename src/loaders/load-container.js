const { createContainer, asClass, asValue, Lifetime } = require('awilix');
const loadLogger = require('../logger');
const services = require('../services');
const subscribers = require('../subscribers');
const kafkaJsLogCreator = require('../logger/kafkajs-log-creator');
const { Kafka } = require('kafkajs');

const loadContainer = async ({ config }) => {
  const container = createContainer({
    injectionMode: 'PROXY',
  });

  const logger = loadLogger(config);
  const inputKafka = new Kafka({
    brokers: config['kafka.input.bootstrap.servers'],
    connectionTimeout: config['kafka.input.bootstrap.servers.timeout'],
    logLevel: config['kafka.lag.streamer.log.level'],
    logCreator: kafkaJsLogCreator(logger),
  });

  const kafkaAdmin = await inputKafka.admin();

  container.register({
    kafkaOffsetConsumerService: asClass(services.KafkaOffsetConsumer, {
      lifetime: Lifetime.SINGLETON,
    }),
    kafkaLagProducerService: asClass(services.KafkaLagProducer, { lifetime: Lifetime.SINGLETON }),
    kafkaGroupMetadataProducerService: asClass(services.KafkaGroupMetadataProducer, {
      lifetime: Lifetime.SINGLETON,
    }),
    recordDecoderService: asClass(services.RecordDecoder, { lifetime: Lifetime.SINGLETON }),
    offsetToLagCalculatorService: asClass(services.OffsetToLagCalculator, {
      lifetime: Lifetime.SINGLETON,
    }),
    partitionsMetadataService: asClass(services.PartitionsMetadata, {
      lifetime: Lifetime.SINGLETON,
    }),
    idleConsumerGroupsUpdaterService: asClass(services.IdleConsumerGroupsUpdater, {
      lifetime: Lifetime.SINGLETON,
    }),
    loadBalancerResponsibilitiesExposerService: asClass(
      services.LoadBalancerResponsibilitiesExposer,
      { lifetime: Lifetime.SINGLETON }
    ),
    recordMonitorSubscriber: asClass(subscribers.RecordMonitor, { lifetime: Lifetime.SINGLETON }),
    groupMetadataMonitorSubscriber: asClass(subscribers.GroupMetadataMonitor, {
      lifetime: Lifetime.SINGLETON,
    }),
    commitOffsetMonitorSubscriber: asClass(subscribers.CommitOffsetMonitor, {
      lifetime: Lifetime.SINGLETON,
    }),
    lagMonitorSubscriber: asClass(subscribers.LagMonitor, { lifetime: Lifetime.SINGLETON }),
    groupLoadBalancerSubscriber: asClass(subscribers.GroupsLoadBalancer, {
      lifetime: Lifetime.SINGLETON,
    }),
    // Using here asValue and not asClass because awilix cant handle unused config options
    kafkaAdmin: asValue(kafkaAdmin),
    inputKafka: asValue(inputKafka),
    consumerLagsKafkaOutput: asValue(
      new Kafka({
        brokers: config['kafka.output.consumer.lags.bootstrap.servers'],
        connectionTimeout: config['kafka.output.consumer.lags.bootstrap.servers.timeout'],
        logLevel: config['kafka.lag.streamer.log.level'],
        logCreator: kafkaJsLogCreator(logger),
      })
    ),
    groupMetadataKafkaOutput: asValue(
      new Kafka({
        brokers: config['kafka.output.group.metadata.bootstrap.servers'],
        connectionTimeout: config['kafka.output.group.metadata.bootstrap.servers.timeout'],
        logLevel: config['kafka.lag.streamer.log.level'],
        logCreator: kafkaJsLogCreator(logger),
      })
    ),
    logger: asValue(logger),
    config: asValue(config),
  });
  return container;
};

module.exports = loadContainer;
