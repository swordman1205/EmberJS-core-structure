import Mixin from 'ember-metal/mixin';
import computed from 'ember-computed';
import { htmlSafe } from 'ember-string';
import on from 'ember-evented/on';
import observer from 'ember-metal/observer';
import { later } from 'ember-runloop';

export default Mixin.create({
  progress: 0,

  isWait: computed('isDone', 'progress', function() {
    return !this.get('isDone') && this.get('progress') === 99.9;
  }),

  status: computed('isDone', 'isWait', function() {
    if (this.get('isDone')) {
      return 'Uploaded';
    }

    if (this.get('isWait')) {
      return 'Almost done';
    }

    return 'Uploading';
  }),

  _v: 256 * 1024 * 1000,   // Speed = 256 KB/s
  _dt: 500,                // Update interval = 100 ms

  _dp: computed(function() {
    const t = this.get('size') / this.get('_v');
    return 100 / t / this.get('_dt');
  }),

  style: computed('progress', function() {
    return htmlSafe(`width: ${this.get('progress')}%;`);
  }),

  tick() {
    if (this.get('_dp')) {
      this.incrementProperty('progress', Math.min(99.9 - this.get('progress'), this.get('_dp')));
    }
  },

  didProgress: on('didInsertElement', observer('progress', function() {
    if (this.get('isDone')) {
      return;
    }

    if (this.get('progress') < 99.9) {
      later(this, this.tick, this.get('_dt'))
    }
  }))
});
