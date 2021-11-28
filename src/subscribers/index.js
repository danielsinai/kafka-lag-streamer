const RecordMonitor = require("./record-monitor");
const CommitOffsetMonitor = require("./commit-offset-monitor");
const LagMonitor = require("./lag-monitor");

const subscribers = {
  RecordMonitor,
  CommitOffsetMonitor,
  LagMonitor
};

module.exports = subscribers;


