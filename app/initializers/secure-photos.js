import EmObject from 'ember-object';
import ImageCipher from 'dekko-frontend/utils/image-cipher';

export function initialize(app) {
  app.set('settings', EmObject.create({
      maxCropSize: 200
  }));

  app.set('blankGif', EmObject.create({ url: '/images/blank.gif' }));
  app.register('cipher:image', ImageCipher);
  app.inject('component:secure-image', 'cipher', 'cipher:image');
}

export default {
  initialize,
  name: 'secure-photos'
};
