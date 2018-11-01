import ApplicationAdapter from './application';
import run from 'ember-runloop';
import RSVP from 'rsvp';
import $ from 'jquery';
import service from 'ember-service/inject';
import config from 'dekko-frontend/config/environment'

export default ApplicationAdapter.extend({
  connection: service(),

  saveDocument: function(url, data) {
    return this.ajax(url, 'POST', {
      data: data
    });
  },

  createRecord: function(store, type, snapshot) {
    const saveDocument = this.saveDocument.bind(this, this.buildURL(type.typeKey));

    return this.serialize(snapshot).then(function(doc) {
      if (doc.icon != null)
        doc.icon.then(function(icon) {
          delete doc.icon;
          doc.iconSecurity = icon.security;
          const form = new FormData();
          form.append('document-icon', icon.data);

          const jqXHR = $.ajax({
            method: 'POST',
            url: [config.APP.host, 'api/v2/icons'].join('/'),
            processData: false,
            contentType: false,
            crossDomain: false,
            headers: {
              'RequestVerificationToken': this.get('connection.verificationToken')
            },
            xhrFields: {
              withCredentials: true
            },
            data: form,
            success: function() {
              return doc.iconUrl = jqXHR.getResponseHeader('Location');
            }
          });

          return new RSVP.Promise(function(resolve) {
            return jqXHR.then(function() {
              return saveDocument(doc);
            }).then(function(doc) {
              return run(null, resolve, doc);
            });
          });
        });
    });
  }
});
