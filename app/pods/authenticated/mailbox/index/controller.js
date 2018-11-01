import Controller from 'ember-controller';
import { reads } from 'ember-computed';
import service from 'ember-service/inject';

export default Controller.extend({
  session: service(),
  lastLogin: reads('session.currentApplication.lastLogin')
});
