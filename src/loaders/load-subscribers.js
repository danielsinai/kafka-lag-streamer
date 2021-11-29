const loadSubscribers = (container) => {
  container.resolve('recordMonitorSubscriber');
  container.resolve('commitOffsetMonitorSubscriber');
  container.resolve('lagMonitorSubscriber');
};

module.exports = loadSubscribers;
