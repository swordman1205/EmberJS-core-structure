import Model from 'ember-data/model';
import { belongsTo, hasMany } from 'ember-data/relationships';
import attr from 'ember-data/attr';
import computed, { alias, empty, equal, notEmpty } from 'ember-computed';

export default Model.extend({
  discussion: belongsTo('discussion'),
  sender: belongsTo('user'),

  parentDiscussion: computed('discussion', 'draftParent.discussion', function() {
    return this.get('discussion') || this.get('draftParent.discussion');
  }),

  draft: belongsTo('reply', { inverse: 'draftParent' }),
  draftParent: belongsTo('reply', { inverse: 'draft' }),
  hasDraft: notEmpty('draft'),
  hasNoDraft: empty('draft'),

  publicRecipients: hasMany('user'),
  copyRecipients: hasMany('user'),
  hiddenRecipients: hasMany('user'),

  deliveryContainer: belongsTo('deliveryContainer'),

  attachments: hasMany('document'),

  attachmentsSize: computed('attachments', function() {
    return this.get('attachments').reduce(function(memo, attachment) {
      return memo + (attachment.get('size') || 0);
    }, 0);
  }),

  subject: attr('string', { defaultValue: '' }),
  message: attr('string', { defaultValue: '' }),
  date: attr('date', { defaultValue: function() { return new Date(); } }),
  type: attr('string', { defaultValue: 'outbox' }),
  isUnread: attr('boolean', { defaultValue: true }),
  isSuccessfullyDecrypted: attr('boolean', { defaultValue: true }),

  canRevoke: attr('boolean', { defaultValue: true }),
  isRevoked: attr('boolean', { defaultValue: false }),

  isInbox: equal('type', 'inbox'),
  isOutbox: equal('type', 'outbox'),
  isDraft: equal('type', 'draft'),

  mainRecipient: alias('publicRecipients.firstObject'),

  // forwardedMessageService: _.once(function() {
  //     return new App.ForwardedReplyMessage();
  // }).property(),

  forwardedMessageSource: computed(function() {
    return this.get('forwardedMessageService').generate(this);
  }),

  attachmentsOutOfCloud: computed('attachments.@each.inCloud', function() {
    return this.get('attachments').rejectBy('inCloud');
  }),

  hasSomeAttachmentsOutOfCloud: computed('attachmentsOutOfCloud.length', function() {
    return this.get('attachmentsOutOfCloud.length') > 0;
  }),
});


// App.ReplySerializer = DS.WebAPISerializer.extend({
//
//     unserialize: function (hash) {
//
//         try {
//             _.extend(hash, decryptPayload(new ShadowKeychain(hash.keychain), hash.data, hash.dataSecurity));
//         }
//         catch (e) {
//             hash.isSuccessfullyDecrypted = false;
//         }
//
//         return hash;
//     },
//
//     serialize: function(record, options) {
//         return this.replyDto().create(record);
//     },
//
//     replyDto: _.once(function() {
//         return new App.ReplyDTO();
//     })
//
// });
