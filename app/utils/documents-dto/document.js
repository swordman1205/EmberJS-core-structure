/* globals FileReader */

import EmObject from 'ember-object';
import service from 'ember-service/inject';
import { reads } from 'ember-computed';
import RSVP from 'rsvp';
import { runLater } from 'ember-runloop';
import { encryptPayload, encryptPayloadArrayAsync } from 'dekko-frontend/utils/crypto-helpers';
import { ajaxFormData } from 'dekko-frontend/utils/ajax-helpers';

export default EmObject.extend({
  store: service(),
  session: service(),
  connection: service(),
  me: reads('session.currentUser'),
  chunk: 256 * 1024, // 256 kb
  fileChunk: 25 * 1024 * 1024, // 25 mb
  counter: 0,
  uploadBigChunkAddress: "/api/chunkedData",

  setUp({ record }) {
    if (record.get('isFolder')) {
      return this.serializeFolder(record);
    } else if (record.get('isNew')) {
      return this.serializeFileForCreation(record);
    } else {
      return this.serializeFileForUpdate(record);
    }
  },

  updateProgress() {
    let newPercent = this.get('doc.progress') + this.persentPerStep;

    if (newPercent >= 90) {
      newPercent = 90;
    }

    this.set('doc.progress', newPercent);
  },

  createFormData(payload) {
    const fd = new FormData();
    fd.append("id", this.get('physicalDocument.id'));
    fd.append("data", new Blob(payload, { type: 'application/octet-stream' }));
    return fd;
  },

  calculatePersentPerStep() {
    return 90 /  Math.ceil(this.get('file').size / this.chunk);
  },

  serializeFileForCreation(doc) {
    return new RSVP.Promise(this.fileReadingTask.bind(this, doc))
      .then(this.whenFileIsUploaded.bind(this, doc));
  },

  finishedBigChunkEncryption() {
    return this.get('index') >= this.get('processLength');
  },

  finishedFileEncryption() {
    return this.get('offset') >= this.get('file').size;
  },

  hasPhysicalDocument() {
    return !!this.get('physicalDocument');
  },

  fileReadingTask(doc, resolve, reject) {
    this.setProperties({
      offset: 0,
      doc,
      file: doc.get('file'),
      resolve,
      reject,
      worker: encryptPayloadArrayAsync((doc.get('uploader') || this.get('me')).get('keychain'))
    });

    this.set('persentPerStep', this.calculatePersentPerStep());
    this.readBigChunk();
  },

  readBigChunk() {
    const offset = this.get('offset');
    const fileChunk = this.get('fileChunk');
    const reader = new FileReader();
    const blob = this.get('file').slice(offset, offset + fileChunk);

    reader.onload = this.processBigChunk.bind(this);
    reader.onerror = this.get('reject');
    reader.readAsArrayBuffer(blob);
  },

  processBigChunk(evt) {
    const data = evt.target.result
    this.setProperties({
      data,
      dataLength: data.byteLength,
      payload: [],
      processLength: Math.ceil(data.buteLength / this.get('chunk')),
      index: 0
    });

    this.processSmallChunks();
  },

  processSmallChunks() {
    const index = this.get('index');
    const data = this.get('data');
    const chunk = this.get('chunk');
    const payload = this.get('payload');

    // Encrypt one chunk of fileChunk
    payload[index] = this.get('worker').process(data.slice(index * chunk, (index + 1) * chunk));
    this.incrementProperty('index');

    if (!this.hasPhysicalDocument()) {
      this.createPhisicalDocument(payload[0].byteLength);
    }
    else {
      this.afterEncryption();
    }
  },

  createPhisicalDocument(chunkSizeAfterEncryption) {
    const physicalDocument = this.get('store').createRecord('physicalDocument', {
      chunkSize: chunkSizeAfterEncryption,
      fileChunkSize: this.fileChunk
    });

    physicalDocument.save().then((function (item) {
      this.set('physicalDocument', item);
      this.afterEncryption();
    }).bind(this));
  },

  afterEncryption() {
    const token = this.get('connection.verificationToken');
    // Update progress bar.
    this.updateProgress();

    if (this.finishedBigChunkEncryption()) {
      // Finished processing this block.
      this.incrementProperty('offset', this.get('fileChunk'));

      ajaxFormData(
        this.get('uploadBigChunkAddress'),
        this.createFormData(this.get('payload')),
        this.afterBigChunkSent.bind(this),
        this.reject,
        token
      );
    }
    else {
      // schedule next process.
      runLater(this, this.processSmallChunks, 50);
    }
  },

  afterBigChunkSent: function() {
    if (this.finishedFileEncryption()) {
      this.get('physicalDocument').reload();

      // If it was last block. Process resolver.
      this.resolve(this.get('worker').contentSecurity);
    }
    else {
        // otherwise read next block.
      this.readBigChunk();
    }
  },

  whenFileIsUploaded: function (doc, contentSecurity) {
    const file = doc.get('file');

    const uploader = doc.get('uploader') || this.get('me');
    const keychain = uploader.get('keychain');
    const name = encryptPayload(keychain, { name: file.name, mimeType: file.type });

    // Icon encryption logic
    /*var icon = this.imaging
        .takeIcon(file, { type: 'base64' })
        .then(function(icon) {

            // Generate iv
            var iv = generateIV();

            // Generate AES key
            var key = generateKey();

            // Encrypt base64 data
            var pt = sjcl.codec.base64.toBits(icon);
            var bits = encryptData(key, pt, iv);

            // Generate salt
            var keySalt = generateSalt();

            // Generate iv
            var keyIV = generateIV();

            // Generate AES key from secret and salt
            var keyKey = metadataSymmetricKey(keySalt, keychain);

            // Encrypt data key from secret
            var dataKey = encryptData(keyKey, key, keyIV);

            return {
                data: new Blob([ new Uint8Array(sjcl.codec.bytes.fromBits(bits)) ]),
                security: objectToBase64(_.mapObject({
                    iv      : iv,
                    keyIV   : keyIV,
                    salt    : keySalt,
                    key     : dataKey

                }, dataToBase64))
            };
        });*/

    return {

        name: name.data,
        nameSecurity: name.security,
        contentSecurity: contentSecurity,
        type: doc.get('type'),
        uploadedAt: doc.get('uploadedAt') || new Date(),
        inCloud: doc.get('inCloud'),
        size: doc.get('size'),
        uploadedFromCompose: doc.get('uploadedFromCompose'),
        uploader: uploader.get('id'),
        folder: doc.get('folder.id'),

        /*icon: icon,*/
        physicalDocument: this.get('physicalDocument.id')
    };
  },

  serializeFileForUpdate: function(doc) {
    const keychain = doc.get('uploader.keychain');

    const name = encryptPayload(keychain, {
      name: doc.get('name'),
      mimeType: doc.get('mimeType')
    });

    return {
      name: name.data,
      nameSecurity: name.security,
      inCloud: doc.get('inCloud'),
      folder: doc.get('folder.id')
    };
  },

  serializeFolder: function(doc) {
    const name = encryptPayload(doc.get('uploader.keychain'), {
      name: doc.get('name')
    });

    return {
      name: name.data,
      nameSecurity: name.security,
      type: doc.get('type'),
      inCloud: true,
      folder: doc.get('folder.id')
    };
  }
});
