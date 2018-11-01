export function initialize (appInstance) {
  const connection = appInstance.lookup('service:connection');
  connection.getToken();
}

export default {
  name: 'setup-connection',
  initialize
};
