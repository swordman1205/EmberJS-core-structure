import Model from 'ember-data/model';
import { belongsTo } from 'ember-data/relationships';
import attr from 'ember-data/attr';
import { equal } from 'ember-computed'

export default Model.extend({
  recipient: belongsTo('user'),
  status: attr('number', { defaultValue: 0 }),
  isReplyRead: equal('status', 0)
});
