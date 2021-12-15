const constants = require("../constants");
const { EventEmitter } = require("events");

class RecordDecoder extends EventEmitter {
  constructor() {
    super();
  }

  _readString(buffer, startOffset) {
    const stringLength = buffer.readInt16BE(startOffset);
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
    const generation = valueBuf.readInt32BE(protocolType.newOffset);
    const protocol = this._readString(valueBuf, protocolType.newOffset + 4);
    const leader = this._readString(valueBuf, protocol.newOffset);
    const currentStateTimestamp = valueBuf.readBigInt64BE(leader.newOffset);
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

  decode({ record }) {
    const keyBuf = record.key;
    const valueBuf = record.value;

    if (!valueBuf || !keyBuf) return; //TODO: add warn

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
        const memberCount = valueBuf.readInt32BE(metadataHeader.newOffset);
        this.emit(constants.events.GROUP_METADATA, {
          group,
          metadataHeader,
          memberCount,
        });
        return;
      }
      default: {
        //Todo: add log
      }

    }
  }
}

module.exports = RecordDecoder;