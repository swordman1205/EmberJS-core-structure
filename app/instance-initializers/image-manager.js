import ImageManager from 'dekko-frontend/lib/image-manager';

export function initialize(app) {
  app.register('manager:image', ImageManager);
  app.inject('serializer:document', 'imaging', 'manager:image');
}

export default {
  initialize,
  name: 'image-manager'
};
