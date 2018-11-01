import Controller from 'ember-controller';
import computed, { reads } from 'ember-computed';
import controller from 'ember-controller/inject';

export default Controller.extend({
  mailbox: controller('authenticated.mailbox'),
  obsolete: reads('mailbox.obsolete'),

  hasIncomingReply: computed('obsolete.@each', 'model', function() {
    return this.get('obsolete').includes(this.get('model'));
  }),

  actions: {
    toggleComplete() {
      const model = this.get('model');
      model.toggleProperty('isComplete');
      model.save();
    }
  }
});
