import Component from 'ember-component';
import computed from 'ember-computed';

export default Component.extend({
  tagName: 'input',
  attributeBindings: ['type', 'checked', 'model'],
  type: 'checkbox',

  checked: computed('model.isChecked', function () {
    return this.get('model.isChecked');
  }),

  didInsertElement: function () {
    this.$().click(this.didChange.bind(this));
  },

  didChange: function (e) {
    this.model.set('isChecked', !this.model.get('isChecked'));
    e.stopPropagation();
    return false;
  },
});
