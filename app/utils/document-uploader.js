import EmObject from 'ember-object';
import service from 'ember-service/inject';
import DownloadDocumentHelper from './download-document-helper';

export default EmObject.extend({
  session: service(),
  store: service(),

  fromFile(file) {
    return this.get('store').createRecord('document', {
      file        : file,
      mimeType    : file.type,
      name        : file.name,
      size        : file.size,
      uploader    : this.get('session.currentUser'),
      uploadedAt  : new Date().toString()
    });
  },

  index(document) {
    if (document.get('size') <= 26214400) {
      new DownloadDocumentHelper(document, this.get('store')).indexDocument()
    }
  },

  upload(file, attrs) {
    const doc = this.fromFile(file);
    doc.setProperties(attrs)
    doc.save().then(this.index)
    return doc
  }
});
