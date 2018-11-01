import Component from 'ember-component';

export default Component.extend({
  classNames: ['compose-attachment'],

  actions: {
    delete() {
      this.sendAction('delete');
    }
  }
});
