const buildLatestOffsetCacheKey = ({ group, partition, topic }) => `${group}-${topic}-${partition}`;

module.exports = buildLatestOffsetCacheKey;