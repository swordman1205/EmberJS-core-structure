import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import computed, { alias } from 'ember-computed';


export default Model.extend({
    name                    : alias('id'),
    nameAlias               : attr('string'),
    domainName              : attr('string'),
    fullName                : attr('string'),

    digest                  : belongsTo('digest', { async: true }),

    isAdmin                 : attr('boolean'),

    canSendEmail            : attr('boolean'),
    email                   : attr('string'),
    signature               : attr('string'),

    photoUrl                : attr('string'),
    iconUrl                 : attr('string'),

    photoSecurity           : attr('string'),
    iconSecurity            : attr('string'),

    inbox                   : attr('number'),
    outbox                  : attr('number'),
    chat                    : attr('number'),
    draft                   : attr('number'),
    isDomainAdmin           : attr('boolean'),
    isCircleMaster          : attr('boolean'),
    lastLogin               : attr('date'),

    isDomainOwner           : attr('boolean'),
    canSubscribe            : attr('boolean'),
    canUnsubscribe          : attr('boolean'),

    country                 : attr('string'),
    companyName             : attr('string'),
    companyWebsite          : attr('string'),
    phone                   : attr('string'),

    domains                 : attr(),
    userType                : attr('string'),

    canInvite : computed('userType', function () {
      return this.get('userType') != 'customer';
    }),
});
