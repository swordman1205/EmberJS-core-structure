import Model     from 'ember-data/model';
import attr      from 'ember-data/attr';

import { reads } from 'ember-computed';

export default Model.extend({
  owner: reads('id'),
  keyX:  attr('string'),
  keyY:  attr('string')
});
