import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import { gt, not } from 'ember-computed';

export default Model.extend({
  name: attr('string'),
  parent: belongsTo('tree', { inverse: 'children' }),
  children: hasMany('tree', { inverse: 'parent' }),
  isRoot: not('parent'),
  hasChildren: gt('children.length', 0)
});
