import Component                       from 'ember-component';
import service                         from 'ember-service/inject';
import { or, and }                     from 'ember-computed';
import { task }                        from 'ember-concurrency';

import { validator, buildValidations } from 'ember-cp-validations';

import { registerTransformator }       from 'dekko-frontend/utils/crypto-helpers';


const Validations = buildValidations({
  fullName: {
    validators: [
      validator('presence', true)
    ]
  },
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
      validator('length', {
        min: 8,
        max: 100,
        message: 'Password length must be in range [8, 100]'
      }),
      validator('dekko-password', {
        message: 'For better security please use stronger password.'
      })
    ]
  },
  confirmPassword: validator('confirmation', {
    on: 'password',
    message: 'Password and its confirmation must be equal'
  }),
}, {
  debounce: 500
});




export default Component.extend(Validations, {
  session: service(),

  // ----- Services -----



  // ----- Overridden properties -----



  // ----- Static properties -----
  errors:          [],
  title:           'DEKKO',
  didValidate:     false,
  isRegistered:    false,
  fullName:        null,
  email:           null,
  password:        null,
  confirmPassword: null,


  serverRegisterEndpoint: 'Account/JsonRegister',
  testDomain:             'amrina',
  testIviteId:            'meruyert@eloquera.com',


  // ----- Computed properties -----
  didValidateAndIsInvalid: and(
    'validations.isInvalid',
    'didValidate'
  ),

  submitButtonDisabled: or(
    'isRegistered',
    'didValidateAndIsInvalid',
    'validations.isValidating',
    'attemptRegisterTask.isRunning'
  ),



  // ----- Overridden Methods -----



  // ----- Custom Methods -----



  // ----- Events and observers -----



  // ----- Tasks -----
  attemptRegisterTask: task(function * ({ fullName, email: userName, password }) {
    const inviteId = this.get('testIviteId');
    const domain   = this.get('testDomain');

    this.set('errors', null);

    const url  = this.get('serverRegisterEndpoint');
    const data = registerTransformator({ inviteId, fullName, userName, password, domain });

    try {
      yield this
        .get('session')
        .makeRequest(url, data).then(() => this.set('isRegistered', true));
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

      const properties = this.getProperties(['fullName', 'email', 'password']);

      this.get('attemptRegisterTask').perform(properties);
    },

    reset() {
      this.setProperties({
        fullName:        null,
        email:           null,
        password:        null,
        confirmPassword: null,
        isRegistered:    false
      });
    }
  }
});
