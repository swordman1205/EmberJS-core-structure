import Component                       from 'ember-component';
import service                         from 'ember-service/inject';
import { or, and }                     from 'ember-computed';
import { task }                        from 'ember-concurrency';

import { validator, buildValidations } from 'ember-cp-validations';

import { loginTransformator }          from 'dekko-frontend/utils/crypto-helpers';


const Validations = buildValidations({
  email: {
    validators: [
      validator('presence', true),
      validator('format', {
        type: 'email'
      })
    ]
  },
  password: {
    description: 'Password',
    validators: [
      validator('presence', true),
    ]
  }
}, {
  debounce: 500,
});




export default Component.extend(Validations, {
  session: service(),

  // ----- Arguments -----


  // ----- Services -----



  // ----- Overridden properties -----



  // ----- Static properties -----
  errors:                    [],
  title:                     'DEKKO',
  isPasswordRecommendations: false,
  didValidate:               false,
  email:                     null,
  password:                  null,
  isLogged:                  false,

  // ----- Computed properties -----
  didValidateAndIsInvalid: and(
    'validations.isInvalid',
    'didValidate'
  ),

  submitButtonDisabled: or(
    'isLogged',
    'didValidateAndIsInvalid',
    'validations.isValidating',
    'attemptAuthTask.isRunning'
  ),



  // ----- Overridden Methods -----



  // ----- Custom Methods -----



  // ----- Events and observers -----



  // ----- Tasks -----
  attemptAuthTask: task(function * (email, password) {
    const passwordHash = loginTransformator(password);

    this.set('errors', null);

    try {
      yield this
        .get('session')
        .authenticate('authenticator:dekko-authenticator', email, password, passwordHash)
          .then(() => this.set('isLogged', true));
    } catch (e) {
      const errors = e && e.errors || e && [JSON.stringify(e, null, 2)] || ["Unknown error"];
      this.set('errors', errors);
    }
  }).drop(),



  // ----- Actions -----
  actions: {
    submit (event) {
      event.preventDefault();

      this.set('didValidate', true);

      const isValid = this.get('validations.isValid');

      if (!isValid) {
        return;
      }

      const email      = this.get('email');
      const password   = this.get('password');

      this.get('attemptAuthTask').perform(email, password);
    },

    togglePasswordRecommendations () {
      this.toggleProperty('isPasswordRecommendations');
    }
  }
});
