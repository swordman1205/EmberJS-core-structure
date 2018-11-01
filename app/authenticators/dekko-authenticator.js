import Base    from 'ember-simple-auth/authenticators/base';
import RSVP    from 'rsvp';
import service from 'ember-service/inject';

import {
  persistMetadata,
  sessionStorageSave
} from 'dekko-frontend/utils/crypto-helpers';

export default Base.extend({
  connection: service(),
  session: service(),

  serverTokenEndpoint:           'Account/JsonLogin',
  serverTokenRevocationEndpoint: 'Account/LogOff',

  restore (data) {
    return RSVP.resolve(data);
  },

  authenticate (email, password, passwordHash) {
    const serverTokenEndpoint = this.get('serverTokenEndpoint');

    return this
      .get('session')
      .makeRequest(serverTokenEndpoint, { login: email, passwordHash })
      .then(result => {
        persistMetadata(result.metadata, password);
        sessionStorageSave('login', email);
        sessionStorageSave('payload', result.payload);
        this.get('connection').getToken();
        return result;
      });
  },

  invalidate () {
    const serverTokenRevocationEndpoint = this.get('serverTokenRevocationEndpoint');

    return this.get('session').makeRequest(serverTokenRevocationEndpoint).then(() => {
      sessionStorage.clear();
    });
  }
});
