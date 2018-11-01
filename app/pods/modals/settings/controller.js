import ModalControllerBase from 'dekko-frontend/lib/controllers/modal-controller-base';
import controller from 'ember-controller/inject';
import computed from 'ember-computed';
import { sanitize } from 'dekko-frontend/helpers/sanitize';
import { countriesList } from 'dekko-frontend/lib/countries-list';

export default ModalControllerBase.extend({
  application: controller(),
  isBasicSettings: true,
  countriesList,

  setupController({ applicationId }) {
    this.set('model', this.get('store').peekRecord('application', applicationId));
  },

  photoTitle: computed('model.fullName', function() {
    return `${this.get('model.fullName')}'s photo`;
  }),

  didSuccess: function() {
    // Force store to refresh current user's model
    this.get('model').reload();
    this.closeModal();
  },

  didError() {
    // TODO: Errors handling
  },

  actions: {
      save: function () {
          // TODO: If more fields will require some post processing.
          // consider moving this logic to serializers.
          const model = this.get('model');
          model.set('signature', sanitize(model.get('signature')));

          model
            .save()
            .then(this.didSuccess.bind(this))
            .catch(this.didError.bind(this));

      },

      close: function () {
        this.get('model').rollbackAttributes();
        this.closeModal();
      },

      changeEdit: function () {
          this.toggleProperty('isBasicSettings');
      },

      changeCountry(value) {
        this.set('model.country', value);
      }
  }
})
