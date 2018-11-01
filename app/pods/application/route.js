import service                from 'ember-service/inject';
import Route                  from 'ember-route';
import ApplicationRouteMixin  from 'ember-simple-auth/mixins/application-route-mixin';
import RSVP                   from 'rsvp';
import { reads }              from 'ember-computed';
import { generateRouteMixin } from 'dekko-frontend/utils/modal/utils';
import { getCookieItem }      from 'dekko-frontend/utils/cookie-helpers';
import { sessionStorageGet, sessionStorageSave } from 'dekko-frontend/utils/crypto-helpers';
import stringResources        from 'dekko-frontend/lib/string-resources';

export default Route.extend(ApplicationRouteMixin, generateRouteMixin('modal', 'modalParams'), {
  session: service(),
  isLoggedIn: reads('session.data.authenticated.success'),

  readCachedPayload: function () {
    return sessionStorageGet("payload");
  },

  flushCachedPayload: function () {
    sessionStorageSave("payload", null);
  },

  model() {
    if (!this.get('isLoggedIn')) {
      return;
    }

    document.title = stringResources.applicationRouteTitle;
    let id = null;

    // Handle the login prebacked data.
    const payload = this.readCachedPayload();

    if (payload) {
      this.flushCachedPayload();
      sessionStorageSave("nameAlias", payload.application.application.nameAlias);
      this.get('store').pushPayload('application', payload.application);
      this.get('store').pushPayload('user', payload.user);
      id = payload.application.application.id;
    }

    return RSVP.hash({
      user: id ? this.get('store').findRecord('user', id) : this.get('store').queryRecord('user', { me: true }),
      application: id ? this.get('store').findRecord('application', id) : this.get('store').queryRecord('application', { me: true })
    });
  },

  setupController(controller, model) {
    if (!this.get('isLoggedIn')) {
      return;
    }

    const { user, application } = model;
    const result = [];
    const domainAlias = application.get('domains');
    this._super(controller, application);

    if (domainAlias.length > 1) {
      result.push({ id: 1, domainName: "All" });

      for (let i = 0; i < domainAlias.length; i++) {
        result.push({ id: i + 2, domainName: domainAlias[i] });
      }
    }
    else {
      result.push({ id: 1, domainName: domainAlias[0] });
    }

    if (getCookieItem("userDomains")) {
      const domainsFromCookie = getCookieItem("userDomains").split('&');

      if (domainsFromCookie.length > 1){
        controller.set('selectedDefaultValue', { id: 1 });
        sessionStorageSave("getSelectedDomainOld", "All");
      } else {
        const resultDomains = result.filter(function (obj) {
          return obj.domainName == domainsFromCookie[0];
        });

        controller.set('selectedDefaultValue', { id: resultDomains[0].id });
        sessionStorageSave("getSelectedDomainOld", domainsFromCookie[0]);
      }
    } else {
      controller.set('selectedDefaultValue', { id: 1 });
    }

    controller.setProperties({
      contentResult: result,
      user
    });

    this.get('session').setProperties({
      currentApplication: application,
      currentUser: user
    })
  },

  afterModel(model, transition) {
    if (transition.targetName === 'authenticated.index') {
      this.transitionTo('authenticated.inbox');
    }
  },

  actions: {
    logout () {
      this.get('session').invalidate();
    },

    domainChanged() {
      window.location.href = '/inbox';
      window.location.reload(true);
    },

    search: function (/* keywords */) {
      // this.transitionTo('search.mail', { queryParams: { q: keywords } });
    },

    refresh() {
      this.refresh();
    },

    attachFromCloud: function (/* model */) {
      // var self = this;
      // App.spinner.spin(document.getElementById('spinner'));
      //
      // this.get('store').findAll('document').then(function(documents) {
      //     // Create outlet
      //   App.spinner.stop();
      //   documents.setEach('isChecked', false);
      //
      //   self.controllerFor('uploadFromCloud').setProperties({
      //     mail: model,
      //     errors: null,
      //     rootFolder: null,
      //     model: documents,
      //   });
      //
      //   return self.render('uploadFromCloud', {
      //     into: 'application',
      //     outlet: 'modal'
      //   });
      //
      // }).catch(function (error) {
      //   App.spinner.stop();
      //   var errorMessage = "Something went wrong. Please try again.";
      //   if (error.responseJSON.message) {
      //     errorMessage = error.responseJSON.message;
      //   }
      //   else if (error.responseJSON.error.message) {
      //     errorMessage = error.responseJSON.error.message;
      //   }
      //
      //   App.controllerFor('uploadFromCloud').setProperties({
      //     mail: null,
      //     model: null,
      //     rootFolder: null,
      //     errors: [errorMessage]
      //   });
      //
      //   return self.render('uploadFromCloud', {
      //     into: 'application',
      //     outlet: 'modal'
      //   });
      // });
    },
  }
});
