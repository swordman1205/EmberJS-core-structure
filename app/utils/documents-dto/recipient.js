import EmObject from 'ember-object';
import _ from 'lodash';

import {
  generateSalt,
  generateIV,
  metadataSymmetricKey,
  encryptData,
  objectToBase64,
  dataToBase64
} from 'dekko-frontend/utils/crypto-helpers';

import DocumentShareDTO from 'dekko-frontend/utils/documents-dto/document-share';

export default EmObject.extend({
  setUp: function(recipient, attachments, meta) {
    var salt = generateSalt();
    var keyIV = generateIV();
    var keyKey = metadataSymmetricKey(salt, recipient.get('keychain'));
    var dataKey = encryptData(keyKey, meta.key, keyIV);
    var dto = this.attachmentDto();

    return {
      id: recipient.get('id'),
      nickname: recipient.get('nickname'),
      type: recipient.get('type'),

      dataSecurity: objectToBase64({
        iv: dataToBase64(meta.iv),
        keyIV: dataToBase64(keyIV),
        salt: dataToBase64(salt),
        key: dataToBase64(dataKey)
      }),

      attachmentsSecurity: attachments.map(function(attachment) {
        return dto.setUp(attachment, recipient);
      })
    };
  },

  attachmentDto: _.once(function() {
    return DocumentShareDTO.create();
  })
})
