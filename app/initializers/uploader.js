import DocumentUploader from 'dekko-frontend/utils/document-uploader';

export function initialize(app) {
  app.register('uploader:document', DocumentUploader);
  app.inject('component:compose-attachments', 'uploader', 'uploader:document');
}

export default {
  initialize,
  name: 'document-uploader'
};
