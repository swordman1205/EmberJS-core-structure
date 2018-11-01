import TextField from 'ember-components/text-field';
import { pluralize } from 'ember-inflector/index';
import { debounce } from 'ember-runloop';
import computed from 'ember-computed';
import observer from 'ember-metal/observer';
import service from 'ember-service/inject';
import _ from 'lodash';
import config from 'dekko-frontend/config/environment';

export default TextField.extend({
  store: service(),
  connection: service(),
  attributeBindings: ['present', 'models'],

  modelName: null,
  idProperty: 'id',
  nameProperty: 'name',
  nicknameProperty: 'nickname',
  queryProperty: 'q',

  url: computed('modelName', function() {
    return [
      config.APP.host,
      'api',
      pluralize(this.get('modelName'))
    ].join('/');
  }),

  didInsertElement: function () {
    this.$().select2(this.configuration()).select2('val', []); // fix for initSelection not firing
    this.$().change(this.valueObserver.bind(this));
  },

  modelsObserver: observer('models.[]', 'models.length', function () {
    debounce(this, this.throttledModelsObserver, 30);
  }),

  throttledObserver: function (prop) {
    const models = this.get('models');

    if (models) {
      const newValue = models.mapBy(prop).join(',');
      const $el = this.$();

      if ($el && newValue !== $el.val()) {
        this.set('modelsChanging', true);
        $el.val(newValue).trigger('change');
        this.set('modelsChanging', false);
      }
    }
  },

  valueObserver: function () {
    if (!this.get('modelsChanging')) {
      const records = this.reduceModel();
      this.get('models').setObjects(records);
    }
  },

  configuration: function () {
    const self = this;
    const token = this.get('connection.verificationToken');

    const headers = token ? { 'RequestVerificationToken': token }: {};

    return {
      minimumInputLength: 2,

      ajax: {
        url: this.get('url'),
        dataType: 'json',
        params: {
          headers,
          crossDomain: false,
          xhrFields: {
            withCredentials: true
          },
        },

        data: function (query) {
          const obj = {};
          obj[self.get('queryProperty')] = query;
          return obj;
        },

        results: function (payload) {
          self.get('store').pushPayload(self.get('modelName'), payload);
          return { results: self.transformItems(self.selectItems(payload)) };
        }
      },

      initSelection: function (element, callback) {
        const present = self.get('present');

        if (present) {
          const items = self.transformItems(present);
          self.set('value', items.mapBy('id').join(','));
          callback(items);
        }
      },

      multiple: true
    };
  },

  selectItems: function (payload) {
    return payload[pluralize(this.get('modelName'))];
  },

  transformItems: function (items) {
    return items.map(this.transformItem.bind(this));
  },
});
