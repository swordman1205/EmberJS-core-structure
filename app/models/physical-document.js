import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  chunkSize: attr('number'),
  count: attr('number'),
  fileChunkSize: attr('number'),
});
