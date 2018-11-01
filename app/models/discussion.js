import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import computed from 'ember-computed';

export default Model.extend({
    replies: hasMany('reply'),
    members: hasMany('user'),
    type: attr('string', { defaultValue: 'outbox' }),
    isComplete: attr('boolean', { defaultValue: false }),

    subject: computed('lastReply', function() {
      return this.getWithDefault('lastReply.subject', '(no subject)');
    }),

    lastReply: computed('replies', 'replies.@each.isNew', 'replies.length', function() {
      return this.get('replies').filter(function(reply) {
        return reply.get('isSaving') || !reply.get('isNew');
      }).get('lastObject');
    })
});
