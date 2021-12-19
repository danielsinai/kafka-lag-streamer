const RecordMonitor = require("./record-monitor");
const CommitOffsetMonitor = require("./commit-offset-monitor");
const LagMonitor = require("./lag-monitor");
const GroupsLoadBalancer = require("./groups-load-balancer");
const GroupMetadataMonitor = require("./group-metadata-monitor");

const subscribers = {
  RecordMonitor,
  CommitOffsetMonitor,
  LagMonitor,
  GroupsLoadBalancer,
  GroupMetadataMonitor,
};

module.exports = subscribers;


