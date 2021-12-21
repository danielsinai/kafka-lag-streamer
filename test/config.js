const config = {
  brokers: ['localhost:9094'],
  topicToTestLagsOn: 'temp.topic',
  group: 'testing-group-not-commiting-offsets',
  groupMetadataTopic: 'group.metadata',
  consumerLagsTopic: 'consumer.lags',
};

module.exports = config;
