import AppSerializer from './application';
import computed from 'ember-computed';
import _ from 'lodash';
import { assign } from 'ember-platform';
import ReplyDTO from 'dekko-frontend/utils/documents-dto/reply';
import { decryptPayload } from 'dekko-frontend/utils/crypto-helpers';
import ShadowKeychain from 'dekko-frontend/utils/shadow-keychain';

export default AppSerializer.extend({
  _dto: computed(function() {
    return ReplyDTO.create();
  }),

  serialize(record) {
    return this.get('_dto').setUp(record);
  },

  normalize(type, hash) {
    const result = this._super(...arguments);

    if (hash.type != "pending") {
      result.data.attributes = _.extend(result.data.attributes, decryptPayload(new ShadowKeychain(hash.keychain), hash.data, hash.dataSecurity));
    }

    if (hash.type == "pending") {
       result.data.attributes.subject = "pending";
       result.data.attributes.message = "";
    }

    return result;
  },

  serializeIntoHash (hash, typeClass, snapshot, options) {
    assign(hash, this.serialize(snapshot, options));

    if (hash.draftParent) {
      hash.type = 'draft';
    }
  },
});
