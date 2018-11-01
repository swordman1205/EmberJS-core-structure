import Route                   from 'ember-route'
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  afterModel() {
    const appModel = this.modelFor('application');

    if (!appModel) {
      this.controllerFor('application').send('refresh');
    }
  },
});
