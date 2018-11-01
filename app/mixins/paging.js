import Mixin from 'ember-metal/mixin';

export default Mixin.create({
  setupController(controller) {
    this._super(...arguments);

    controller.setProperties({
      skip  : this.get('skip'),
      top   : this.get('top')
    });
  },

  actions: {
    prevPage() {
      let skip = this.get('skip') - this.get('top');
      if (skip < 0) { skip = 0; }
      this.set('skip', skip);
      this.refresh();
    },

    nextPage() {
      this.incrementProperty('skip', this.get('top'));
      this.refresh();
    }
  }
});
