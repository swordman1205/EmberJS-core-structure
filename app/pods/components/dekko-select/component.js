import Component from 'dekko-frontend/components/x-select';
import diffAttrs from 'ember-diff-attrs';

export default Component.extend({
  didUpdateAttrs: diffAttrs('value', function(changedAttrs, ...args) {
    this._super(...args);

    // Need to open on lazy models
    if (this.get('isDirty')) {
      this.open();
    }

    // Update input if value has changed
    if(changedAttrs && changedAttrs.value) {
      const oldValue = changedAttrs.value[0];
      const newValue = changedAttrs.value[1];

      if (oldValue && newValue && oldValue !== newValue) {
        const { label } = this.retrieveOption(newValue);

        if (label !== this.get('token')) {
          this.setOption(newValue);
        }
      }
    }
  })
})
