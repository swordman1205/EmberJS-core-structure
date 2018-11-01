import Component from 'ember-component';
import computed, { oneWay } from 'ember-computed';

export default Component.extend({
  tagName: 'img',
  attributeBindings: ['imageUrl:src', 'alt'],
  imageUrl: oneWay('image.url'),

  image: computed('src', 'security', function() {
    const src = this.get('src');
    const security = this.get('security');

    if (src && security) {
      return this.get('cipher').decryptFromUrl(src, security, {
        publicKey: this.get('publicKey')
      });
    } else {
      return {
        url: this.getWithDefault('defaultImg', '/images/blank.gif')
      };
    }
  })
});
