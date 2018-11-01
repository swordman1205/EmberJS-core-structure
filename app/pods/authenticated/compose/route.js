import Route from 'ember-route';
import service from 'ember-service/inject';
import { reads } from 'ember-computed';

export default Route.extend({
  session: service(),
  me: reads('session.currentUser'),

  model(params){
    const draft = this.get('draft');
    const store = this.get('store');

    const model = draft ? draft : store.createRecord('reply', {
      discussion  : store.createRecord('discussion'),
      sender      : this.get('me')
    });

    if(params['to']) {
      this
        .get('store')
        .findRecord('user', params['to'])
        .then(user => model.get('publicRecipients').addObject(user));
    }

    return model;
  },

  setupController(controller, reply) {
    this._super(...arguments)
    const d = reply.get('discussion');

    reply.one('didCreate', this, () => {
      this.send('reload');
      this.transitionTo('compose.preview', d);
    });

    reply.get('discussion').one('didCreate', this, () => {
      this.get('controller').tailSave();
    });
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      this.set('draft', null);
    }

    const m = controller.get('model');
    const d = m.get('discussion');

    m.off('didCreate');
    d.off('didCreate');
  },

  actions: {
    refresh() {
      this.set('draft', null);
      this.refresh()
    }
  }
});
