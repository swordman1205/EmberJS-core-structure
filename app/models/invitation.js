import Model     from 'ember-data/model';
import attr      from 'ember-data/attr';

export default Model.extend({

  owner           : attr('string'),
  fullName        : attr('string'),
  userName        : attr('string'),
  domainRequest   : attr('string'),
  usersRequest    : attr('number'),
  domainName      : attr('string'),
  email           : attr('string'),
  phone           : attr('string'),
  companyName     : attr('string'),
  companyWebsite  : attr('string'),
  country         : attr('string'),
  promoCode       : attr('string'),
  stripe          : attr('string'),
  isChecked       : attr('boolean', { defaultValue: false }),
  isDisabled      : attr('boolean'),

  number          : attr('string'),
  cvc             : attr('string'),
  exp_month       : attr('string'),
  exp_year        : attr('string'),
  //
  // validations: {
  //
  //   fullName: {
  //     presence: true,
  //     presence: { message: 'Full Name must not be blank' },
  //   },
  //
  //   domainRequest: {
  //     presence: true,
  //     presence: { message: 'Circle name must not be blank' },
  //     format: {
  //       with: /^[a-zA-Z0-9_]+$/,
  //       message: 'Please use only letters, numbers and the \"_\" symbol for the domain name'
  //     }
  //   },
  //   usersRequest: {
  //     presence: true,
  //     presence: { message: 'Required' },
  //     format: {
  //       with: /^([1-9][0-9]{0,2}|1000)$/,
  //       message: 'Number of Users must between 1 and 1000'
  //     }
  //   },
  //
  //   email: {
  //     presence: true,
  //     presence: { message: 'Email must not be blank' },
  //     format: {
  //       with: /^[\w+\-.]+@[a-z\d\-.]+\.[a-z]+$/i,
  //       message: 'Must be a valid e-mail address'
  //     }
  //   },
  //
  //   phone: {
  //     presence: true,
  //     presence: { message: 'Phone Number must not be blank' },
  //   },
  //
  //   companyName: {
  //     presence: true,
  //     presence: { message: 'Company Name must not be blank' },
  //   },
  //
  //   companyWebsite: {
  //     presence: true,
  //     presence: { message: 'Company Website must not be blank' },
  //   },
  //
  //   country: { presence: true },
  //
  //   number: {
  //     presence: true,
  //     format: {
  //       with: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
  //       message: 'Not a valid Credit card number!'
  //     }
  //   },
  //
  //   cvc: {
  //     presence: true,
  //     format: {
  //       with: /^[0-9]{3,4}$/,
  //       message: 'Not a valid CVC Number'
  //     }
  //
  //   },
  //
  //   exp_month: {
  //     presence: true,
  //     inclusion: { range: [1, 12], allowBlank: false, message: 'must be between 1 and 12' },
  //     numericality: true,
  //     numericality: { messages: { numericality: 'Must be a number' } }
  //   },
  //
  //   exp_year: {
  //     presence: true,
  //     format: {
  //       with: /2[0-9]{3}/i,
  //       message: 'Year can not be blank and must use (YYYY) format'
  //     }
  //   },
  // },
});

//
// App.InvitationSerializer = DS.WebAPISerializer.extend({
//   omittedAttributes: ['number', 'cvc', 'exp_month', 'exp_year'],
// });