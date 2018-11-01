import EmObject from 'ember-object';
import { assign } from 'ember-platform';
import _ from 'lodash';
import $ from 'jquery';

import {
  generateIV,
  generateKey,
  encryptString,
  dataToBase64,
  hashStr
} from 'dekko-frontend/utils/crypto-helpers';

import RecipientDTO from 'dekko-frontend/utils/documents-dto/recipient';

export default EmObject.extend({
  setUp: function({ record }) {
    this.reply = record;
    this.iv = generateIV();
    this.key = generateKey();
    this.result = {};

    this.prepareRecipients();
    this.assembleData(record.get('subject'), record.get('message'));
    this.assembleSender(record.get('sender'), record.get('attachments'));
    this.assembleKeywords();
    this.assembleRecipients('publicRecipients', this.publicRecipients, record.get('attachments'));
    this.assembleRecipients('copyRecipients', this.copyRecipients, record.get('attachments'));
    this.assembleRecipients('hiddenRecipients', this.hiddenRecipients, record.get('attachments'));

    assign(this.result, {
      discussion: record.get('discussion.id'),
      type: record.get('type')
    });

    this.getDraftParent();
    return this.result;
  },

  assembleData: function(subject, message) {
    var payload = encryptString(this.key, JSON.stringify({
      subject: subject,
      message: message
    }), this.iv);

    this.result.data = dataToBase64(payload);
  },

  assembleSender: function(sender, attachments) {
    var meta = _.pick(this, 'iv', 'key');
    this.result.sender = this.recipientDto().setUp(sender, attachments, meta);
  },

  assembleRecipients: function(what, recipients, attachments) {
    var dto = this.recipientDto();
    var meta = _.pick(this, 'iv', 'key');

    this.result[what] = recipients.map(function(recipient) {
      return dto.setUp(recipient, attachments, meta);
    });
  },

  assembleKeywords: function() {
    this.result.keywords = hashStr(
      this.splitMessage(this.reply.get('message')),
      this.split(this.reply.get('subject')),
      this.split(this.reply.get('sender.nickname')),
      this.split(this.publicRecipients.mapBy('nickname')),
      this.split(this.copyRecipients.mapBy('nickname')),
      this.split(this.hiddenRecipients.mapBy('nickname'))
    );
  },

  prepareRecipients: function() {
    // Note that we eliminate duplication in any destination field
    // we eliminated duplications between destination carbonCopy and blindCarbonCopy.

    var publ = this.reply.get('publicRecipients.content') || [];
    var copy = this.reply.get('copyRecipients.content') || [];
    var hidden = this.reply.get('hiddenRecipients.content') || [];

    publ = publ.uniq();
    copy = _.difference(copy.uniq(), publ);
    hidden = _.difference(hidden.uniq(), publ, copy);

    this.publicRecipients = publ;
    this.copyRecipients = copy;
    this.hiddenRecipients = hidden;

    this.reply.get('publicRecipients').setObjects(publ);
    this.reply.get('copyRecipients').setObjects(copy);
    this.reply.get('hiddenRecipients').setObjects(hidden);
  },

  split: function(str) {
    if (_.isArray(str)) {
      return str;
    }

    return _.isString(str) ? str.toLowerCase().match(/\w+/g) || []: [];
  },

  splitMessage: function(message) {
    message = (message || '').replace(/(?:&nbsp;|\n)/, '');
    var pieces = [], self = this;

    $('<div>', {html: message}).each(function() {
      $(this).contents().each(function() {
        pieces.push(self.split($(this).text()));
      });
    });

    return _.filter(_.flatten(pieces), function(piece) {
      return _.isString(piece) && piece.length;
    });
  },

  getDraftParent: function () {
    var draftParent = this.reply.get('draftParent');

    if (draftParent !== null) {
      this.result.draftParent = draftParent.get('id');
    }
  },

  recipientDto: _.once(function() {
    return RecipientDTO.create();
  })



});
