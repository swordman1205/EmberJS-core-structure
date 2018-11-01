import Component from 'ember-component';

export default Component.extend({
  classNames: ['msg-preview-list', 'main'],

  actions: {
    prevPage() {
      this.sendAction('prevPage');
    },

    nextPage() {
      this.sendAction('nextPage');
    }
  }
});
