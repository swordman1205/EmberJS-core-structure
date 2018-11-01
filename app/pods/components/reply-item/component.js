/* globals JSZip, saveAs */

import Component from 'ember-component';
import computed, { bool, reads } from 'ember-computed';
import service from 'ember-service/inject';
import getOwner from 'ember-owner/get';
import RSVP from 'rsvp';
import { A } from 'ember-array/utils';
import { addSignature } from 'dekko-frontend/utils/text-helpers';
import { mailRevoke, tryIndexDocument } from 'dekko-frontend/utils/indexing-helpers';
import DownloadDocumentHelper from 'dekko-frontend/utils/download-document-helper';
import ForwardedReplyMessage from 'dekko-frontend/utils/forwarded-reply-message';

/**
 * @ This is an unknown bullshit
 */
function flushRecord (record) {
  // changing to loaded.updated.inFlight, which has "didCommit"
  record.send('willCommit');
  // clear array of changed (dirty) model attributes
  record.set('_attributes', {});
  // changing to loaded.saved (hooks didCommit event in "inFlight" state)
  record.send('didCommit');
}

export default Component.extend({
  cache: service(),
  session: service(),
  store: service(),

  classNames: ['msg-item'],
  classNameBindings: ['isExpanded:active'],
  tagName: 'li',

  me: reads('session.currentUser'),

  app: computed(function() {
    return getOwner(this).lookup('controller:application');
  }),

  mailbox: computed(function() {
    return getOwner(this).lookup('controller:authenticated.mailbox');
  }),

  outboxType: 'outbox',
  isExpanded: reads('model.isExpanded'),
  hasDraft: bool('model.draft.content'),

  recipientsForReply: function (reply) {
    let recipients = [];

    if (reply.get('isOutbox')) {
      recipients = reply.get('publicRecipients.content');
    } else {
      recipients = A([reply.get('sender')]);
    }

    return this._filterRecipients(recipients);
  },

  recipientsForReplyAll: function (reply) {
    const recipients = reply.get('publicRecipients.content');

    if (!reply.get('isOutbox')) {
      recipients.pushObject(reply.get('sender.content'));
    }

    return this._filterRecipients(recipients);
  },

  copyRecipientsForReplyAll: function (model) {
    return model.get('copyRecipients.content');
  },

  _filterRecipients: function (recipients) {
    const self = this;

    return recipients.filter(function (recipient){
      return recipient.get('id') !== self.get('me.id');
    });
  },

  isLast: computed('lastObject', function() {
    return this.get('lastObject') === this.get('model');
  }),

  canReply: computed('model.sender.id', 'model.isNew', function() {
    return this.get('model.sender.id') !== 'administrator@dekko.com' && !this.get('model.isNew');
  }),

  forwardedMessageService: computed(function() {
    return new ForwardedReplyMessage();
  }),

  forwardedMessageSource: computed(function() {
    return this.get('forwardedMessageService').generate(this.get('model'));
  }),

  actions: {
    toggleExpand: function() {
      this.toggleProperty('isExpanded');
    },

    markAsRead: function() {
      if (!this.get('isUnread')) return;

      this
        .get('mailbox')
        .findBy('id', this.get('discussion.id'))
        .set('isInboxUnread', false);

      this.set('isUnread', false);

      this
        .get('model')
        .save()
        .then(function(r) {
          r.get('deliveryContainer').reload();
        });
    },

    reply: function () {
      const reply = this.get('model');
      const draft = this.draftForReply(reply);
      draft.get('publicRecipients').addObject(this.recipientsForReplyAll(reply).get('firstObject'));
    },

    replyAll: function () {
      const reply = this.get('model');
      const draft = this.draftForReply(reply);

      draft.get('publicRecipients').addObjects(this.recipientsForReplyAll(reply));
      draft.get('copyRecipients').addObjects(this.copyRecipientsForReplyAll(reply));
    },

    forward: function () {
      const reply = this.get('model');
      const draft = this.draftForReply(this.get('model'));

      draft.set('subject', 'Fwd: ' + reply.get('subject'));
      draft.set('message', addSignature(this.get('app'), this.get('forwardedMessageSource')));
      draft.get('attachments').addObjects(reply.get('attachments'));
    },

    downloadAllAttachments: function (reply) {
      const self = this;
      const attachments = reply.get('attachments');

      const promises = attachments.map(function(doc) {
        return self.store.find('documentContent', doc.get('id'));
      });

      self.set('isDownloading', true);

      RSVP.all(promises).then(function (contents) {
        const bufferPromises = contents.map(function (item) {
          return item.get('buffer');
        });

        RSVP.all(bufferPromises).then(function (buffers) {
          self.set('isDownloading', false);
          const zip = new JSZip();
          let buffer;
          let doc;

          for (let i = 0; i < buffers.length; i++) {
            buffer = buffers[i];
            doc = attachments.objectAt(i);

            if (!doc.get('isReaded')) {
              tryIndexDocument(doc, buffer);
            }

            zip.file(doc.get('name'), buffer, { base64: false, binary: true });
          }

          const blob = zip.generate({ type: 'blob' });
          saveAs(blob, 'Attachments.zip');
        });
      });
    },

    downloadAttachment: function (doc) {
      new DownloadDocumentHelper(doc).save();
    },

    revoke: function () {
      const model = this.get('model');
      const discussionId = model.get('discussion.id');

      mailRevoke({
        discussion: discussionId,
        reply: model.get('id')
      }, function () {
        model.set('isRevoked', true);
        model.set('canRevoke', false);
        flushRecord(model);

        var discussionSummary = this.get('store').all('discussionSummary').findBy('id', discussionId);

        if (discussionSummary) {
          discussionSummary.reload();
        }

        this.get('app.model').reload();
      });
    }
  },

  shouldCreateDraft: function (model) {
    return !model.get('draft');
  },

  draftForReply: function(reply) {
    return this.get('store')
      .createRecord('reply', {
        deliveryContainer: this.get('store').createRecord('deliveryContainer'),
        sender      : this.get('me'),
        subject     : reply.get('subject'),
        draftParent : reply
      });
  },

  /* Obsolete */
  createDraft: function(model) {
    let draft;

    if (this.shouldCreateDraft(model)) {
      draft = this.get('store').createRecord('reply', {
        deliveryContainer: this.get('store').createRecord('deliveryContainer')
      });

      draft.set('draftParent', model);
      model.set('draft', draft);
      this.get('cache').invalidate('discussionSummary', 'draft');
    } else {
      draft = model.get('draft');
    }

    draft.set('sender', this.get('me'));
    draft.set('subject', model.get('subject'));
    draft.set('type', 'draft');
    draft.get('publicRecipients').clear();
    draft.get('copyRecipients').clear();
    draft.get('hiddenRecipients').clear();

    return draft;
  }
});
