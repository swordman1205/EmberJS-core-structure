import Mixin from 'ember-metal/mixin';
import _ from 'lodash';
import decryptPayload from 'dekko-frontend/utils/crypto-helpers';
import ShadowKeychain from 'dekko-frontend/utils/shadow-keychain';

export default Mixin.create({
  unserialize: function (hash) {
    try {
        _.extend(hash, decryptPayload(new ShadowKeychain(hash.keychain), hash.name, hash.nameSecurity));
    }
    catch (e) {
        hash.isSuccessfullyDecrypted = false;
    }

    return hash;
  }
});
