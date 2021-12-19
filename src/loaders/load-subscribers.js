const loadSubscribers = (container) => {
  container.resolve("recordMonitorSubscriber");
  container.resolve("groupMetadataMonitorSubscriber");
  container.resolve("groupLoadBalancerSubscriber");
  container.resolve("commitOffsetMonitorSubscriber");
  container.resolve("lagMonitorSubscriber");
};

module.exports = loadSubscribers;

