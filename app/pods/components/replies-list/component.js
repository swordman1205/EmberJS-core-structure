import Component from 'ember-component';
import { gt, reads } from 'ember-computed';
import observer from 'ember-metal/observer';
import on from 'ember-evented/on';
import $ from 'jquery';

export default Component.extend({
  classNames: ['msg-list'],
  classNameBindings: ['expanded'],

  expanded: false,
  hasMultipleReplies: gt('model.length', 1),
  lastObject: reads('model.lastObject'),

  lastReplyDidChange: on('init', observer('lastObject', 'model.@each.isExpanded', function() {
    const lastObject = this.get('lastObject');
    const expanded = this.get('model').filterBy('isExpanded', true);

    if (lastObject && expanded.get('length') === 0) {
      lastObject.set('isExpanded', true);
    }
  })),

  scrollCompute() {
    const bodyHeight = $('body').height();
    const headerHeight = $('.header').height() + $('.widget-box').height() + $('.msg-data-headline').height();
    const scrollHeight = this.$().get(0).scrollHeight;
    if (bodyHeight - headerHeight < scrollHeight) {
      this.set('expanded', true);
    }
  },

  setScroll: on('didRender', observer('model.[]', function() {
    this.scrollCompute();
  })),

  actions: {
    toggleExpandAll() {
      const model = this.get('model');
      const expanded = !model.isEvery('isExpanded')
      model.setEach('isExpanded', expanded);
      this.scrollCompute();
    }
  }
});
