import Controller from 'ember-controller';
import controller from 'ember-controller/inject';
import service from 'ember-service/inject';
import { reads } from 'ember-computed';
import PagingSupport from 'dekko-frontend/mixins/paging-support';
import $ from 'jquery';

export default Controller.extend(PagingSupport, {
  application: controller(),
  session: service(),
  // abstractAuth: controller(),
  sortProperties: ['date'],
  sortAscending: false,
  lastLogin: reads('session.currentApplication.lastLogin'),

  isChecked: (function() {
      return this.get('model').isAny('isChecked');
      // return false;
  }).property('model.@each.isChecked'),

  filteredContent: (function () {
      // return this.model.content;
      //return ["abc", "def", "something"];
      return this.get('model').rejectBy('isDeleted');
      //return [];
  }).property('model.@each.isDeleted'),

  actions: {
    "delete": function() {
      var checked;
      checked = this.filterBy('isChecked');

      return $.ajax({
        method: 'POST',
        url: '/Mail/DeleteSummary',
        data: {
          id: checked.getEach('id'),
          isDraft: this.get('isDraft')
        },
        success: (function(_this) {
          return function() {
            return _this.send('reload');
          };
        })(this)
      });
    },

    uncheckAll: function() {
      return this.get('model').setEach('isChecked', false);
    }
  }
});
