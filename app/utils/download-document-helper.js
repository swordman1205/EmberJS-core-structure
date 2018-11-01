/* globals saveAs */

import { later } from 'ember-runloop';
import { decryptPayloadArrayAsync } from 'dekko-frontend/utils/crypto-helpers';
import combineArrayBuffers from 'dekko-frontend/utils/array-buffer-helpers';
import { tryIndexDocument } from 'dekko-frontend/utils/indexing-helpers';

export default class DownloadDocumentHelper {
  constructor(doc, store) {
    this.hasToSave = true;
    this.requestBigChunkAddress = "/api/chunkedData";

    this.doc = doc;
    this.count = 0;

    this.worker = decryptPayloadArrayAsync(doc.get('uploader.keychain'), doc.get('contentSecurity'));

    this.chunkBlobs = [];
    this.chunkBlobsCount = 0;

    this.index = 0;
    this.chunk = 0;
    this.processLength = 0;
    this.payload = [];

    this.data = null;
    this.store = store;
  }

  save() {
    this.hasToSave = true;
    this.doc.set('isDownloading', true);
    this.store.find('physicalDocument', this.doc.get('physicalDocument')).then(this.getPhysicalMeta.bind(this));
  }

  indexDocument() {
    this.hasToSave = false;
    this.store.find('physicalDocument', this.doc.get('physicalDocument')).then(this.getPhysicalMeta.bind(this));
  }

  getPhysicalMeta(physicalDocument) {
    this.physicalDocument = physicalDocument;
    this.download();
  }

  hasToGetNextBigChunk() {
    return this.count < this.physicalDocument.get('count');
  }

  hasToProcessNextSmallChunk() {
    return !(this.index >= this.processLength);
  }

  download() {
    if (this.hasToGetNextBigChunk()) {
      this.requestBigChunk(this.count++);
    }
    else {
      this.saveDocument();
    }
  }

  requestBigChunk(num) {
    const queryString = this.requestBigChunkAddress + "?" + "id=" + this.physicalDocument.get('id') + "&num=" + num;
    const http = new XMLHttpRequest();
    http.open("GET", queryString, true);
    http.responseType = "arraybuffer";
    http.onload = this.processBigChunk.bind(this);
    http.send();
  }

  saveDocument() {
    try {
      if (!this.doc.get('isReaded')) {
        tryIndexDocument(this.doc, this.chunkBlobs);
      }
    } catch (e) {
      // don't do anything.
    }

    if (this.hasToSave) {
      this.doc.set('isDownloading', false);
      saveAs(new Blob(this.chunkBlobs, { type: this.doc.get('type') }), this.doc.get('name'));
    }
  }

  processBigChunk(evt) {
    this.data = evt.target.response;
    this.index = 0;
    this.chunk = this.physicalDocument.get('chunkSize');
    this.processLength = Math.ceil(this.data.byteLength / this.chunk); // Current iteration count.
    this.payload = [];
    this.processSmallChunks();
  }

  processSmallChunks() {
    // decrypt one small chunk
    this.payload.push(this.worker.process(this.data.slice(this.index * this.chunk, (this.index + 1) * this.chunk)));
    this.index++;

    if (this.hasToProcessNextSmallChunk()) {
      // schedule next small chunk process.
      later(this, this.processSmallChunks, 50);
    }
    else {
      this.chunkBlobs[this.chunkBlobsCount++] = combineArrayBuffers(this.payload);
      this.download();
    }
  }

}
