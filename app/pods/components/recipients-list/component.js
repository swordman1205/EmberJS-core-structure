import Component from 'ember-component';
import computed from 'ember-computed';

export default Component.extend({
  mainRecipients: computed('recipients.[]', function() {
    return this.get('recipients').slice(0, 3);
  }),

  otherRecipients: computed('recipients.[]', function() {
    return this.get('recipients').slice(3);
  }),

  hasRecipients: computed('recipients.[]', function() {
    return this.get('mainRecipients.length') > 0;
  }),

  allRecipientsAreShown: computed('otherRecipients.[]', function() {
    return this.get('otherRecipients.length') < 1;
  }),

  actions: {
    showAllRecipients: function() {
      this.set('allRecipientsAreShown', true);
    }
  }
});
