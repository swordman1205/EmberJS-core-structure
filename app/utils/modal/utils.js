import Mixin from 'ember-metal/mixin';
import registerModalListener from './register-listener';

export function generateControllerMixin(modalPropertyName, modalParamsPropertyName) {
  return {
    queryParams: [modalPropertyName, modalParamsPropertyName],
    [modalPropertyName]: null,
    [modalParamsPropertyName]: null,
  };
}

export function generateRouteMixin(modalPropertyName, modalParamsPropertyName) {
  return Mixin.create({
    setupController(controller, ...args) {
      this._super(controller, ...args);
      registerModalListener(this, controller, modalPropertyName, modalParamsPropertyName);
    }
  });
}
