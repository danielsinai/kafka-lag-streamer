const buildConsumerGroupCacheKey = ({ group, topic }) => `${group}-${topic}`;

module.exports = buildConsumerGroupCacheKey;