const constants = require("../constants");
const { EventEmitter } = require("events");

class RecordDecoder extends EventEmitter {
  constructor({ logger }) {
    super();
    this._logger = logger;
  }

  _readString(buffer, startOffset) {
    const stringLength = buffer.readInt16BE(startOffset);

    if (stringLength === -1) return { newOffset: startOffset + 2, decoded: "" };

    const stringLengthBytes = 2; //[size - 2bytes][...string - stringLengthBytes]
    const stringStartOffset = startOffset + stringLengthBytes;
    const stringEndOffset = stringStartOffset + stringLength;
    return {
      decoded: buffer.slice(stringStartOffset, stringEndOffset).toString(),
      newOffset: stringEndOffset
    };
  }

  _decodeMetadataHeader(valueBuf) {
    const protocolType = this._readString(valueBuf, 2);
    const generation = valueBuf.readInt32BE(protocolType.newOffset);
    const protocol = this._readString(valueBuf, protocolType.newOffset + 4);
    const leader = this._readString(valueBuf, protocol.newOffset);
    return ({
      protocolType: protocolType.decoded,
      generation,
      protocol: protocol.decoded,
      leader: leader.decoded
    });
  }

  _decodeMetadataHeaderV2(valueBuf) {
    const protocolType = this._readString(valueBuf, 2);
    const generation = parseInt(valueBuf.readInt32BE(protocolType.newOffset));
    const protocol = this._readString(valueBuf, protocolType.newOffset + 4);
    const leader = this._readString(valueBuf, protocol.newOffset);
    const currentStateTimestamp = parseInt(valueBuf.readBigInt64BE(leader.newOffset));
    return ({
      protocolType: protocolType.decoded,//TODO: if protocol not consumer skip
      generation,
      protocol: protocol.decoded,
      leader: leader.decoded,
      currentStateTimestamp,
      newOffset: leader.newOffset + 8
    });
  }

  _decodeOffsetValueV3(valueBuf) {
    const offset = valueBuf.readBigInt64BE(2);
    const leaderEpoch = valueBuf.readInt32BE(10);
    const metadata = this._readString(valueBuf, 14);
    const timestamp = valueBuf.readBigInt64BE(metadata.newOffset);
    return ({
      offset,
      leaderEpoch,
      metadata: metadata.decoded,
      timestamp,
      newOffset: metadata.newOffset + 8
    });
  }


  _decodeOffsetValue(valueBuf) {
    const offset = valueBuf.readBigInt64BE(2);
    const metadata = this._readString(valueBuf, 10);
    const timestamp = valueBuf.readBigInt64BE(metadata.newOffset);
    return ({
      offset,
      metadata: metadata.decoded,
      timestamp,
      newOffset: metadata.newOffset + 8
    });
  }

  _decodePartitionAssignment(valueBuf, offset) {
    const topics = {};
    const numTopics = parseInt(valueBuf.readInt32BE(offset));
    offset += 4;
    for (let i = 0; i < numTopics; i++) {
      const topicName = this._readString(valueBuf, offset);
      offset = topicName.newOffset;
      const numPartitions = parseInt(valueBuf.readInt32BE(offset));
      offset += 4;
      for (let j = 0; j < numPartitions; j++) {
        const partitionId = parseInt(valueBuf.readInt32BE(offset));
        offset += 4;
        topics[topicName.decoded] = topics[topicName.decoded] ? [...topics[topicName.decoded], partitionId] : [partitionId];
      }
      const userDataLen = parseInt(valueBuf.readInt32BE(offset));
      offset += 4 + userDataLen;
    }
    return topics;
  }

  _decodeAssignment(valueBuf, assignmentBytes) {
    let offset = 0;
    if (assignmentBytes > 0) {
      const consumerProtocolVersion = valueBuf.readInt16BE(offset);
      offset += 2;
      if (consumerProtocolVersion < 0) {
        //TODO: log warn for old client
        return { consumerProtocolVersion };
      }
      const assignment = this._decodePartitionAssignment(valueBuf, offset);
      return {
        consumerProtocolVersion,
        assignment
      };
    }
  }

  // mutable for the sake of performance
  _decodeMetadataMember(valueBuf, offset, metadataMemberVersion) {
    const members = [];
    const memberCount = valueBuf.readInt32BE(offset);
    offset += 4;
    for (let i = 0; i < memberCount; i++) {
      const memberId = this._readString(valueBuf, offset);
      offset = memberId.newOffset;
      const groupInstanceId = metadataMemberVersion === 3 ? this._readString(valueBuf, offset) : {
        newOffset: offset,
        decoded: "unknown"
      };
      offset = groupInstanceId.newOffset;
      const clientId = this._readString(valueBuf, offset);
      offset = clientId.newOffset;
      const clientHost = this._readString(valueBuf, offset);
      offset = clientHost.newOffset;
      const rebalanceTimeout = metadataMemberVersion >= 1 ? parseInt(valueBuf.readInt32BE(offset)) : -1;
      offset += 4;
      const sessionTimeout = parseInt(valueBuf.readInt32BE(offset));
      offset += 4;
      const subscriptionBytes = valueBuf.readInt32BE(offset);
      offset += 4 + parseInt(subscriptionBytes);
      const assignmentBytes = valueBuf.readInt32BE(offset);
      offset += 4;
      const {
        assignment,
        consumerProtocolVersion
      } = this._decodeAssignment(valueBuf.slice(offset, assignmentBytes + offset), assignmentBytes);

      members.push({
        assignment,
        consumerProtocolVersion,
        sessionTimeout,
        rebalanceTimeout,
        clientHost: clientHost.decoded,
        clientId: clientId.decoded,
        groupInstanceId: groupInstanceId.decoded
      });
    }
    return members;
  }

  decode({ record }) {
    const keyBuf = record.key;
    const valueBuf = record.value;

    if (!valueBuf || !keyBuf) {
      this._logger.warn("Key or buffer of the input topic record are empty!");
      return;
    }

    const keyVer = keyBuf.readInt16BE();
    switch (keyVer) {
      case 0:
      case 1: {
        const group = this._readString(keyBuf, 2);
        const topic = this._readString(keyBuf, group.newOffset);
        const partition = keyBuf.readInt32BE(topic.newOffset);
        const valueVer = valueBuf.readInt16BE();
        const offsetValue = valueVer < 3 ?
          this._decodeOffsetValue(valueBuf) :
          this._decodeOffsetValueV3(valueBuf);
        this.emit(constants.events.COMMIT_OFFSET, {
          group: group.decoded,
          topic: topic.decoded,
          offset: Number(BigInt(offsetValue.offset)),
          partition
        });
        return;
      }
      case 2: {
        const group = this._readString(keyBuf, 2).decoded;
        const valueVer = valueBuf.readInt16BE();
        const metadataHeader = valueVer > 1 ?
          this._decodeMetadataHeaderV2(valueBuf) :
          this._decodeMetadataHeader(valueBuf);
        const metadataMembers = this._decodeMetadataMember(valueBuf, metadataHeader.newOffset, valueVer);
        this.emit(constants.events.GROUP_METADATA, {
          group,
          metadataHeader,
          metadataMembers
        });
        return;
      }
      default: {
        this._logger.warn(`A message have been consumed, but could not be decoded 
        - check your kafka version compatibility or your input topic configuration`
        );
      }
    }
  }
}

module.exports = RecordDecoder;