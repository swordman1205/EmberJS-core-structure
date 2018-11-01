import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import computed, { alias, equal, not } from 'ember-computed';
import _ from 'lodash';

export default Model.extend({
  isAttachment: attr('boolean'),

  name: attr('string'),
  size: attr('number'),
  type: attr('string', { defaultValue: 'file' }),
  mimeType: attr('string'),
  uploadedAt: attr('string'),

/*    iconUrl: attr('string'),
  iconSecurity: attr('string'),*/

  path: hasMany('folderPath'),

  folder: belongsTo('document', {async: true, inverse: 'documents'}),
  documents: hasMany('document', {async: true, inverse: 'folder'}),

  uploader: belongsTo('user'),
  physicalDocument: attr('string'),

  inCloud: attr('boolean', { defaultValue: true }),

  nameSecurity: attr('string'),
  contentSecurity: attr('string'),

  isFolder: equal('type', 'folder'),
  isFile: equal('type', 'file'),
  owner: alias('uploader'),

  isRoot: not('folder.id'),

  isSuccessfullyDecrypted: attr('boolean', { defaultValue: true }),

  format: computed('name', 'mimeType', function() {
    let tp;

    if (this.get('isFolder')) {
      tp = 'folder';
    } else {
      const mime = this.get('mimeType');
      tp = mime && _.last(mime.split('/'));
      tp = tp || _.first(String(this.get('name')).match(/[^\.]+$/));
    }

    return String.prototype.toUpperCase.call(tp || 'unknown');
  }),

  hasNestedFolders: computed('documents.@each.isFolder', 'documents.length', function() {
    return !!this.get('documents').findBy('isFolder');
  }),

  hasPath: computed('path.length', function () {
    return this.get('path.length') > 0;
  }),

  hasTail: computed('path.length', function () {
    return this.get('path.length') > 1;
  }),

  headPath: computed('path.length', function () {
    return this.get('path').objectAt(0);
  }),

  tailPath: computed('path.length', function () {
    return this.get('path').slice(1, this.get('path.length'));
  })
});
