export function initialize(appInstance) {
  const service = appInstance.lookup('service:notification-messages');
  service.setDefaultAutoClear(true);
  service.setDefaultClearDuration(5000);

  ['controller', 'component', 'route', 'router'].forEach(injectionTarget => {
    appInstance.inject(injectionTarget, 'notifications', 'service:notification-messages');
  });
}

export default {
  name: 'notifications',
  initialize
};
