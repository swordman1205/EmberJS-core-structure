import Component from 'ember-component';
import observer from 'ember-metal/observer';
import { isBlank } from 'ember-utils';

export default Component.extend({
  classNames: ['editor'],

  valueDidChange: observer('replyId', function() {
    if (!isBlank(this.get('replyId'))) {
      this.$editorElement.html(this.get('value'));
    }
  }),

  didInsertElement() {
    this.$editorElement = this.$('#editor-content');

    this.$editorElement.wysiwyg();

    this.$editorElement.html(this.get('value'));

    if (this.get('autofocus')) {
      this.$editorElement.focus();
    }

    this.$editorElement.on('change', () => {
      const content = this.$editorElement.cleanHtml();
      this.set('value', content);
    });
  },

  willDestroyElement() {
    this.$editorElement.off('change');
    delete this.$editorElement;
  }
});
