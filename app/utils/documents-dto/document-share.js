import EmObject from 'ember-object';
import service from 'ember-service/inject';
import { reads } from 'ember-computed';
import { adaptDocumentSecurity } from 'dekko-frontend/utils/crypto-helpers';

export default EmObject.extend({
  session: service(),
  me: reads('session.currentUser'),

  setUp: function (doc, accessor) {
    var ownerKeychain = doc.get('owner.keychain');
    var accessorKeychain = accessor.get('keychain');

    return {
      id: doc.get('id'),
      nameSecurity: adaptDocumentSecurity(doc.get('nameSecurity'), ownerKeychain, accessorKeychain),
      contentSecurity: adaptDocumentSecurity(doc.get('contentSecurity'), ownerKeychain, accessorKeychain)
    }
  },

  belongsToMe: function (doc) {
    return doc.get('uploader.nickname') === this.get('me.nickname');
  }
});
