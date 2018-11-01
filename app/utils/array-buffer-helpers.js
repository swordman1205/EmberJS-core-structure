/* globals ArrayBuffer, Uint8Array */
import _ from 'lodash';

export default function combineArrayBuffers(payload) {
  // Minor optimisation.
  if (payload.length == 1)
      return payload[0];

  // Append block in one.
  var payloadArrayBuffer = new ArrayBuffer(_.reduce(payload, function (memo, item) {
    return memo + item.byteLength;
  }, 0));

  var payloadView = new Uint8Array(payloadArrayBuffer);

  _.reduce(payload, function (memo, item) {
    payloadView.set(new Uint8Array(item), memo); return memo + item.byteLength;
  }, 0);

  return payloadArrayBuffer;
}
