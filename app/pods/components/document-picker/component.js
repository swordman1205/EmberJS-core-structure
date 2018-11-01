import TextField from 'ember-components/text-field';

export default TextField.extend({
  type        : 'file',
  multiple    : true,
  isVisible   : false,
  classNames  : ['document-picker'],

  change(e) {
    this.sendAction('action', e.target.files);
  }
});
