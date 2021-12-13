const loadIdleConsumerGroupsUpdater = async (container) => {
  const idleConsumerGroupsUpdate = container.resolve("idleConsumerGroupsUpdater");

  await idleConsumerGroupsUpdate.initGroupsCache();
  await idleConsumerGroupsUpdate.listenToExpiration();

};

module.exports = loadIdleConsumerGroupsUpdater;

