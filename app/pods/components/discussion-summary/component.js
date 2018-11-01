import Component from 'ember-component';
import computed, { gt, reads } from 'ember-computed';
import service from 'ember-service/inject';

export default Component.extend({
  store: service(),
  classNames: ['msg-preview'],
  classNameBindings: ['isHighlighted:new'],

  hasReplies: gt('model.repliesNumber', 0),
  memberList: reads('model.finalSender.name'),

  route: computed('hubType', function() {
    var type;
    type = this.get('hubType');

    if (type !== 'chat') {
      return `authenticated.${type}.discussion`;
    } else {
      return 'authenticated.chat';
    }
  }),

  isHighlighted: computed('ctrl.isInboxUnread', 'ctrl.isOutboxUnread', function() {
    switch (this.get('hubType')) {
      case 'inbox':
      case 'chat':
        return this.get('ctrl.isInboxUnread');
      case 'outbox':
        return this.get('ctrl.isOutboxUnread');
      default:
        return false;
    }
  }),

  actions: {
    toggleComplete: function() {
      return this.store.find('discussion', this.get('id')).then(function(d) {
        d.toggleProperty('isComplete');
        return d.save().then((function(_this) {
          return function() {
            return _this.set('isComplete', d.get('isComplete'));
          };
        })(this));
      });
    }
  }
});
