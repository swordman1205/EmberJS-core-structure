import DS from 'ember-data';

const {attr} = DS;

export default DS.Model.extend({

  dbId            : attr('number'),
  name            : attr('string'),
  nickname        : attr('string'),
  photoUrl        : attr('string'),
  photoSecurity   : attr('string'),
  iconUrl         : attr('string'),
  iconSecurity    : attr('string'),
  isOnline        : attr('boolean'),
  isDisabled      : attr('boolean'),

  keychain        : DS.belongsTo('keychain')
});

// App.UserSerializer = DS.WebAPISerializer.extend({
//
//   omittedAttributes: ['isOnline', 'photoUrl', 'iconUrl', 'name'],
//   omittedAttributesOnUpdate: 'nickname',
//   omittedBelongsTo: 'keychain'
//
// });
//
// App.Contact = App.User.extend({
//
//   isVirtual: attr('boolean'),
//
//   isFavorite: attr('boolean'),
//   isTrusted: attr('boolean'),
//   trustsMe: attr('boolean'),
//   tags: DS.hasMany('tag', { async: true })
// });