import RESTAdapter      from 'ember-data/adapters/rest';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import config           from 'dekko-frontend/config/environment';
import service          from 'ember-service/inject';
import URL              from 'url';

export default RESTAdapter.extend(DataAdapterMixin, {
  connection: service(),

  host:       config.APP.host,
  namespace:  config.APP.namespace,
  authorizer: 'authorizer:dekko-authorizer',

  ajax (url, method, hash) {
    hash = hash || {};
    hash.crossDomain = false;
    hash.xhrFields = {
      withCredentials: true
    };

    return this._super(...arguments);
  },

  urlForQueryRecord(query, modelName) {
    if (['application', 'user'].includes(modelName) && query.me) {
      delete query.me;
      const url = new URL(this._super(...arguments));
      url.pathname += '/me';
      return url.toString();
    }

    return this._super(...arguments);
  }
});
