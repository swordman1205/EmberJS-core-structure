import RESTSerializer from 'ember-data/serializers/rest';
import DocumentUnserializationMixin from 'dekko-frontend/mixins/document-unserialization';
import DocumentDTO from 'dekko-frontend/utils/documents-dto/document';

export default RESTSerializer.extend(DocumentUnserializationMixin, {
  // omittedAttributes: ['', ''],

  serialize: function(record) {
    const imaging = this.get('imaging');

    return DocumentDTO.create({
      imaging
    }).setUp(record);
  }
});
