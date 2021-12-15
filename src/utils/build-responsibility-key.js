const buildResponsibilityKey = ({ group, topic, partition }) => `${group}$$${topic}$$${partition}`;

module.exports = buildResponsibilityKey;