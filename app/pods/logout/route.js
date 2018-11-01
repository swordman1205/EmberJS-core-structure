import Route from 'ember-route'
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin'


export default Route.extend(AuthenticatedRouteMixin, {

  // ----- Overridden methods -----
  beforeModel () {
    this.send('logout');
  }

});
