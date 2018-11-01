import Mixin from 'ember-metal/mixin';

export default Mixin.create({
  model(params) {
    return this.get('store').find('discussion', params.id);
  }
});
