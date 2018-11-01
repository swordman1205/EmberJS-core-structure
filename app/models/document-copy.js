import Model from 'ember-data/model';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  document: belongsTo('document'),
  folder: belongsTo('document')
});
