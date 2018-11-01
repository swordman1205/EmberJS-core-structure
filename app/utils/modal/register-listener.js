import $ from 'jquery';
import { scheduleOnce, once } from 'ember-runloop';
import { isBlank, typeOf } from 'ember-utils';
import get from 'ember-metal/get';

class ModalHandler {
  constructor(route, controller, modalNameBinding, modalParamsBinding) {
    this.route = route;
    this.controller = controller;
    this.modalNameBinding = modalNameBinding;
    this.modalParamsBinding = modalParamsBinding;
  }

  getModalName() {
    return get(this.controller, this.modalNameBinding);
  }

  getModalParams() {
    const params = get(this.controller, this.modalParamsBinding);
    return isBlank(params) ? undefined : JSON.parse(atob(params));
  }

  open() {
    $(document.body).addClass('modal-open');
    const modalName = this.getModalName();
    const controller = this.route.controllerFor(modalName);

    if (typeOf(controller.setupController) === 'function') {
      controller.setupController(this.getModalParams());
    }

    this.route.render(modalName, {
      into: 'application',
      outlet: 'modal'
    });
  }

  close() {
    $(document.body).removeClass('modal-open');
    this.route.disconnectOutlet({
      outlet: 'modal',
      parentView: 'application'
    });
  }

  refresh() {
    if (isBlank(this.getModalName())) {
      this.close();
    } else {
      this.open();
    }
  }
}

export default function registerModalListener(route, controller, modalNameBinding, modalParamsBinding) {
  const handler = new ModalHandler(route, controller, modalNameBinding, modalParamsBinding);
  function refresh() {
    handler.refresh();
  }
  controller.addObserver(modalNameBinding, modalParamsBinding, () => once(route, refresh));
  scheduleOnce('afterRender', refresh);
}
