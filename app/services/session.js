import service                     from 'ember-service/inject';
import SessionService              from 'ember-simple-auth/services/session';
import RSVP                        from 'rsvp';
import { typeOf }                  from 'ember-utils';
import { isEmberArray as isArray } from 'ember-array/utils';
import config                      from 'dekko-frontend/config/environment';

export default SessionService.extend({
  ajax:          service(),
  connection:    service(),
  dataStore:     service('store'),
  notifications: service('notification-messages'),

  currentUser:        null,
  currentApplication: null,

  makeRequest (url, data={}) {
    const fullUrl = [config.APP.host, url].join('/');

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'RequestVerificationToken': this.get('connection.verificationToken')
    };

    const options = {
      data,
      headers,
      method: 'POST',
      crossDomain: false,
      xhrFields: {
       withCredentials: true
      }
    };

    return new RSVP.Promise((resolve, reject) => {
      this.get('ajax')
        .request(fullUrl, options)
        .then(json => {
          if (json.success || typeOf(json) === 'boolean' && json) {
            resolve(json);
          } else {
            if (json.errors && isArray(json.errors)) {
              json.errors.forEach(error => this.get('notifications').error(error));
            }

            reject(json);
          }
        }).catch(reject);
    });
  }
});
