const loadIdleConsumerGroupsUpdater = async (container) => {
  const idleConsumerGroupsUpdate = container.resolve("idleConsumerGroupsUpdaterService");

  await idleConsumerGroupsUpdate.initGroupsCache();
  await idleConsumerGroupsUpdate.listenToExpiration();

};

module.exports = loadIdleConsumerGroupsUpdater;

