import DiscussionsController from 'dekko-frontend/lib/controllers/discussions';
import { equal } from 'ember-computed';
import controller from 'ember-controller/inject';

export default DiscussionsController.extend({
  application: controller(),
  isDraft: equal('hubType', 'draft'),
  obsolete: [],

  actions: {
    incomingMail: function(id) {
      const obsolete = this.store.all('discussion').findBy('id', id);

      if (obsolete) {
        return this.get('obsolete').addObject(obsolete);
      }
    }
  }
});
