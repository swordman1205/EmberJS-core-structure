import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import observer from 'ember-metal/observer';
import { assign } from 'ember-platform';

export default Model.extend({
  sender: belongsTo('user'),
  finalSender: belongsTo('user', { async: true }),

  repliesNumber: attr('number', { defaultValue: 0 }),
  hasAttachments: attr('boolean', { defaultValue: false }),

  subject: attr('string', { defaultValue: '(no subject)' }),
  message: attr('string', { defaultValue: '' }),
  date: attr('date', { defaultValue: null }),
  type: attr('string', { defaultValue: 'inbox' }),

  isInboxUnread: attr('boolean', { defaultValue: true }),
  isOutboxUnread: attr('boolean', { defaultValue: true }),

  isComplete: attr('boolean', { defaultValue: false }),
  isChecked: attr('boolean', { defaultValue: false }),
  isSuccessfullyDecrypted: attr('boolean', { defaultValue: true }),

  isInbox: attr('boolean'),
  isOutbox: attr('boolean'),

  recipient: belongsTo('user'),
  members: hasMany('user'),

  discussionObserver: observer('discussion', 'discussion.lastReply', 'discussion.isComplete', function() {
    var dis = this.get('discussion');
    var reply = dis.get('lastReply');

    if (!reply) return;

    var props = assign({}, {
      isComplete  : dis.get('isComplete'),
      recipient   : reply.get('mainRecipient')
    }, reply.getProperties('sender', 'subject', 'message', 'date'));

    this.setProperties(props);
  })
});
