const config = {
  brokers: ['localhost:9094'],
  topicToTestLagsOn: 'temp.topic',
  group: 'groupy',
  groupMetadataTopic: 'group.metadata',
  consumerLagsTopic: 'consumer.lags',
};

module.exports = config;
