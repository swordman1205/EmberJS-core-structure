import AppSerializer from './application';
import _ from 'lodash';
import { decryptPayload } from 'dekko-frontend/utils/crypto-helpers';
import { subjectPreview } from 'dekko-frontend/utils/text-helpers';
import ShadowKeychain from 'dekko-frontend/utils/shadow-keychain';

export default AppSerializer.extend({
  normalize: function (type, hash) {
    const result = this._super(...arguments);

    if (hash.type != "pending") {
      result.data.attributes = _.extend(result.data.attributes, decryptPayload(new ShadowKeychain(hash.keychain), hash.data, hash.dataSecurity));
    }

    if (hash.type == "pending") {
       result.data.attributes.subject = "pending";
       result.data.attributes.message = "";
    }

    if (hash.subject) {
      result.data.attributes.subject = subjectPreview(hash.subject);
    } else if (hash.type === "pending") {
      result.data.attributes.subject = "pending...";
    }

    return result;
  }
});
