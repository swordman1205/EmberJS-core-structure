import RESTSerializer from 'ember-data/serializers/rest';
import DocumentUnserializationMixin from 'dekko-frontend/mixins/document-unserialization';

export default RESTSerializer.extend(DocumentUnserializationMixin);
