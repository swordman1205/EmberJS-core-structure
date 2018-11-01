/* globals Uint8Array */

import EmObject from 'ember-object';
import { PromiseObject } from 'ember-data/-private/system/promise-proxies';
import RSVP from 'rsvp';
import _ from 'lodash';
import { base64ToData, base64ToObject, metadataSymmetricKey, decryptData } from 'dekko-frontend/utils/crypto-helpers';
import sjcl from 'sjcl';

export default EmObject.extend({
  _fetch: function(url) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.setRequestHeader('Accept', 'application/octet-stream');
    xhr.responseType = 'arraybuffer';

    return new RSVP.Promise(function(resolve, reject) {
      xhr.addEventListener('load', function() {
        if (this.status == 200) {
          resolve(new Uint8Array(this.response));
        }
      });

      xhr.addEventListener('error', reject);
      xhr.send();
    });
  },

  _decryptAsym: function(data, security, publicKey) {
    // Restoring security props
    security = base64ToObject(security);
    security = _.mapObject(security, function(val) {
        return base64ToData(val);
    });

    // Get AES key from secret and salt
    var keyKey = metadataSymmetricKey(security.salt, publicKey);

    // Decrypt data key from secret
    var key = decryptData(keyKey, security.key, security.keyIV);

    // Preparing bits for cipher
    var ct = sjcl.codec.bytes.toBits(data);

    // Decrypting image bits
    var bits = decryptData(key, ct, security.iv);

    return new Blob([ new Uint8Array(sjcl.codec.bytes.fromBits(bits)) ], { type: 'image/png' });
  },

  _decrypt: function(data, security) {
    // Restoring security data object
    security = base64ToObject(security);

    // Restoring security properties
    var iv = base64ToData(security.iv);
    var key = base64ToData(security.key);

    // Preparing bits for cipher
    var ct = sjcl.codec.bytes.toBits(data);

    // Decrypting image bits
    var bits = decryptData(key, ct, iv);

    // Constructing Blob from bits
    return new Blob([ new Uint8Array(sjcl.codec.bytes.fromBits(bits)) ], { type: 'image/png' });
  },

  decryptFromUrl: function(url, security, options) {
    options = options || {};
    const publicKey = options.publicKey;
    const self = this;

    return PromiseObject.create({
      promise: this._fetch(url)
        .then(function(data) {
          const img = publicKey
            ? self._decryptAsym(data, security, publicKey)
            : self._decrypt(data, security);

          return { url: URL.createObjectURL(img) };
        })
    });
  }
});
