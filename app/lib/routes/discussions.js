import Route from 'ember-route';
import Paging from 'dekko-frontend/mixins/paging';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, Paging, {
  skip: 0,
  top: 10,

  model: function() {
    return this.store.query('discussionSummary', {
      type: this.hubType,
      skip: this.get('skip'),
      top: this.get('top')
    });
  },

  activate: function() {
    // return this.controllerFor('widgets').set('activeWidget', 'discussion');
  },

  deactivate: function() {
    return this.set('skip', 0);
  },

  renderTemplate: function() {
    return this.render(this.templateName, {
      controller: this.controllerName
    });
  },

  setupController: function(controller /* , summaries */) {
    this._super(...arguments);
    return controller.set('hubType', this.get('hubType'));
  },

  actions: {
    reload: function() {
      return this.refresh();
    }
  }
});
