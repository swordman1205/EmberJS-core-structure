import Mixin from 'ember-metal/mixin';
import computed, { not } from 'ember-computed';

export default Mixin.create({
  total: computed('model.meta', function() {
    var meta;
    meta = this.get('model.meta');
    return meta != null ? meta[this.get('hubType')] : void 0;
  }),

  isFirstPage: not('skip'),

  isLastPage: computed('skip', 'top', 'total', function() {
    return this.get('skip') + this.get('top') >= this.get('total');
  }),

  firstOnPage: computed('skip', function() {
    return this.get('skip') + 1;
  }),

  lastOnPage: computed('skip', 'top', function() {
    return this.get('skip') + this.get('top');
  })
});
