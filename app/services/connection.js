import Service from 'ember-service';
import service from 'ember-service/inject';
import config from 'dekko-frontend/config/environment';

function removeDoubleQuotes(text) {
  return text.replace(/(^"|"$)/g, '');
}

export default Service.extend({
  ajax: service(),
  verificationToken: null,

  getToken() {
    const {
      host,
      namespace,
      tokenPath
    } = config.APP;

    const getTokenPath = [
      host,
      namespace,
      tokenPath
    ].join('/');

    this.get('ajax').request(getTokenPath, {
      crossDomain: false,
      xhrFields: {
        withCredentials: true
      }
    }).then(response => {
      const verificationToken = removeDoubleQuotes(response);
      this.set('verificationToken', verificationToken);
    });
  }
});
