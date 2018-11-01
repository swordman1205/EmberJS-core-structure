import Component from 'ember-component';
import computed, { equal } from 'ember-computed';

export default Component.extend({
  tagName: 'span',
  classNames: ['recipient-name', 'recipient-status'],
  classNameBindings: ['delivery.isReplyRead:done'],

  isOutbox: equal('model.type', 'outbox'),

  delivery: computed('deliveries.@each.isReplyRead', function() {
    return this.get('deliveries').findBy('recipient.id', this.get('recipient.id'));
  })
});
