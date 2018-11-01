import AjaxService from 'ember-ajax/services/ajax';
import service     from 'ember-service/inject';
import computed    from 'ember-computed';

import config      from 'dekko-frontend/config/environment';


const hostWithoutProtocol = config.APP.host.replace(/(^\w+:|^)\/\//, '');

export default AjaxService.extend({
  connection: service(),

  trustedHosts: [
    hostWithoutProtocol
  ],

  headers: computed('connection.verificationToken', {
    get() {
      const headers           = {};
      const verificationToken = this.get('connection.verificationToken');

      if (verificationToken) {
        headers['RequestVerificationToken'] = verificationToken;
      }

      return headers;
    }
  })
});
