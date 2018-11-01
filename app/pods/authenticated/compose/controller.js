import Controller from 'ember-controller';
import computed, { or, reads } from 'ember-computed';
import { isEmpty } from 'ember-utils';
import Evented from 'ember-evented';
import on from 'ember-evented/on';
import observer from 'ember-metal/observer';
import { debounce } from 'ember-runloop';
import service from 'ember-service/inject';

export default Controller.extend(Evented, {
  notifications: service(),
  queryParams: ['to'],
  to: null,
  isSaving: or('model.isSaving', 'model.discussion.isSaving'),

  isWorking: computed('isSaving', 'model.attachments.@each.isSaving', function() {
    return this.get('isSaving') || this.get('model') && this.get('model.attachments').isAny('isSaving', true);
  }),

  isCcEditing: computed(function() {
    return !isEmpty(this.get('cc'));
  }),

  isBccEditing: computed(function() {
    return !isEmpty(this.get('bcc'));
  }),

  isDirty: computed('model.isDirty', 'model.isNew', 'edit', 'address', 'attach', function() {
    if (!this.get('model.isNew')) {
      return this.get('model.isDirty');
    }

    return [
      'model.subject',
      'model.message',
      'model.publicRecipients',
      'model.copyRecipients',
      'model.hiddenRecipients',
      'model.attachments'
    ].reject(key => isEmpty(this.get(key))).get('length');
  }),

  cc: reads('model.copyRecipients'),
  bcc: reads('model.hiddenRecipients'),

  didEdit: observer('model.subject', 'model.message', function() {
    return this.notifyPropertyChange('edit');
  }),

  didAddress: observer('model.publicRecipients.@each.id', 'cc.@each.id', 'bcc.@each.id', function() {
    this.notifyPropertyChange('address');
  }),

  didAttach: on('didAttach', function() {
    this.notifyPropertyChange('attach');
  }),

  save: function() {
    if (this.get('isSaving')) {
      return;
    }

    if (!this.get('isDirty')) {
      return;
    }

    const d = this.get('model.discussion.content');

    if (d && d.get('isNew')) {
      return d.save();
    } else {
      return this.tailSave();
    }
  },

  tailSave: function() {
    // const self = this;

    return this
      .get('model.content')
      .save()
      .finally(function() {
        // TODO WTF?
        // if (self.get('isDirty') && !self.get('isWorking')) {
        //   return self.tailSave();
        // }
      });
  },

  debounceSave: computed(function() {
    return (function() {
      debounce(this, this.save, 2000);
    }).bind(this);
  }),

  autoSave: observer('edit', 'address', 'attach', function() {
    if (!this.get('isWorking')) {
      return this.get('debounceSave')();
    }
  }),

  actions: {
    cc: function() {
      this.set('isCcEditing', true);
      return false;
    },

    bcc: function() {
      this.set('isBccEditing', true);
      return false;
    },

    discard: function() {
      const self = this;

      return this.get('model.content').destroyRecord().then(function() {
        return self.send('refresh');
      });
    },

    send() {
      const self = this;

      if (this.get('model.publicRecipients.length') === 0) {
        this.get('notifications').error('Address should not be empty');
        return;
      }

      const promise = this.save();

      if (promise) {
        promise.then(function() {
          return self.send('refresh');
        });
      }
    },

    attach() {
      this.get('documentPickerAction')();
    }
  }
});
