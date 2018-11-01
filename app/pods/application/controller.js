import Controller from 'ember-controller';
import service from 'ember-service/inject';
import { reads } from 'ember-computed';
import observer from 'ember-metal/observer';
import on from 'ember-evented/on';
import fetch from 'ember-network/fetch';
import { generateControllerMixin } from 'dekko-frontend/utils/modal/utils';
import { sessionStorageGet, sessionStorageSave } from 'dekko-frontend/utils/crypto-helpers';
import config from 'dekko-frontend/config/environment';

export default Controller.extend(generateControllerMixin('modal', 'modalParams'), {
  selectedDomainAlias: {},
  selectedDefaultValue: {},
  session: service(),
  isLoggedIn: reads('session.isAuthenticated'),

  onSelectedDomainAliasChange: on('init', observer('selectedDomainAlias', function () {
    const self = this;
    const selectedDomain = this.get("selectedDomainAlias.domainName");
    const fullUrl = [config.APP.host, 'SetCookies/Cookies'].join('/');

    if (selectedDomain && selectedDomain !== sessionStorageGet("getSelectedDomainOld")) {
      const options = {
        credentials: 'include',
        crossDomain: false,
        method: "GET",
        xhrFields: {
          withCredentials: true
        }
      };

      fetch(`${fullUrl}?domains=${selectedDomain}`, options).then(function() {
        self.send("domainChanged");
        // var contacts = App.controllerFor('contacts').store.find('contact');
        // self.get('controllers.contacts').set('model', contacts);
        sessionStorageSave("getSelectedDomainOld", selectedDomain);
      });
    }
  })),

  actions: {
    changeDomain(value, { domainName, id}) {
      this.set('selectedDomainAlias', {
        domainName,
        id
      });
    },
  }
})
