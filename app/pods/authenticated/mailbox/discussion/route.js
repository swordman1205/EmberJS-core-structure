import Route from 'ember-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import UseDiscussionModel from 'dekko-frontend/mixins/use-discussion-model';

export default Route.extend(AuthenticatedRouteMixin, UseDiscussionModel, {
  templateName    : 'authenticated.mailbox.discussion',
  controllerName  : 'authenticated/mailbox/discussion',

  beforeModel() {
    const id = (this.paramsFor(this.routeName)).id;
    const obsolete = this.controllerFor('authenticated.mailbox').get('obsolete');
    const found = obsolete.findBy('id', id);

    if (found) {
      found.reload().then(d => obsolete.removeObject(d));
    }
  },

  // afterModel(discussion) {
  //   return this.controllerFor('replies').set('content', discussion.get('replies'));
  // },

  actions: {
    refresh() {
      return this.refresh();
    }
  }
});
