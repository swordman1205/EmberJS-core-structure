import Base    from 'ember-simple-auth/authorizers/base';
import service from 'ember-service/inject';

export default Base.extend({
  connection: service(),

  authorize (jqXHR, setRequestHeader) {
    const verificationToken = this.get('connection.verificationToken');
    setRequestHeader('RequestVerificationToken', verificationToken);
  }
});
