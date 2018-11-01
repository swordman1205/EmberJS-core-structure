import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('signup');
  this.route('login');
  this.route('logout');

  this.route('authenticated', {path: '/'}, function() {
    this.route('compose');
    this.route('mailbox');

    this.route('inbox', function() {
      this.route('discussion', { path: ':id' });
    });

    this.route('outbox', function() {
      this.route('discussion', { path: ':id' });
    });

    this.route('draft', function() {
      this.route('draftReply', { path: 'compose' }, function() {
        this.route('compose',   { path: '/' });
        this.route('edit',      { path: ':id' });
      });

      this.route('discussion', { path: ':id' });
    });

    this.route('chats', function() {
      this.route('chat', { path: ':id' });
    });

    this.route('contacts', function() {
      this.route('contact', { path: ':id'}, function() {
        this.route('edit');
      });
    });

    this.route('cloud', function() {
      this.route('folder', { path: 'folder/:id' });
      this.route('recent');
    });

    this.route('approve');
    this.route('circle-master');

  });
});

export default Router;
