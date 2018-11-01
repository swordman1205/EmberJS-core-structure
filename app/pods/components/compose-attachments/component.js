import Component from 'ember-component';
import getOwner from 'ember-owner/get';
import computed, { bool } from 'ember-computed';
import observer from 'ember-metal/observer';
import DocumentUpload from 'dekko-frontend/mixins/document-upload';

export default Component.extend(DocumentUpload, {
  isVisible: bool('attachments.length'),

  compose: computed(function() {
    return getOwner(this).lookup('controller:authenticated.compose');
  }),

  didAttach: observer('attachments.@each.isNew', function() {
    if (!this.get('attachments').isAny('isNew', true)) {
      this.get('compose').trigger('didAttach');
    }
  }),

  didInsertElement() {
    this.set('documentPickerAction', this.openDocumentPicker.bind(this));
  },

  openDocumentPicker() {
    this.$('.document-picker').click();
  },

  actions: {
    attach(files) {
      let file;

      for(let i = 0; i < files.length; i++) {
        file = files[i];

        this.get('attachments').addObject(this.get('uploader').upload(file, {
          uploadedFromCompose : true,
          inCloud             : false
        }))
      }
    },

    detach(document) {
      this.get('attachments').removeObject(document);
    }
  }
});
