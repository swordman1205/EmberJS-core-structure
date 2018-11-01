import EmObject from 'ember-object';
import _ from 'lodash';
import RSVP from 'rsvp';
import constants from 'dekko-frontend/lib/constants';
import base64toBlob from 'dekko-frontend/utils/file-helpers';

export default EmObject.extend({
  _drawIcon: function(original, resolve) {
    const img = new Image();

    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const iconSize = constants.ICON_SIZE;
      canvas.width = canvas.height = iconSize;
      ctx.drawImage(img, 0, 0, iconSize, iconSize);
      return resolve(canvas);
    };

    return img.src = URL.createObjectURL(original);
  },

  _toBase64: function(canvas, type) {
    const url = canvas.toDataURL(type);
    return url.substr(url.indexOf(',') + 1);
  },

  _toBlob: function() {
    return base64toBlob(this._toBase64.apply(this, arguments));
  },

  takeIcon: function(original, options) {
    _.defaults(options, {
      type: 'blob'
    });

    const drawIcon = this._drawIcon.bind(this, original);

    return new RSVP.Promise(drawIcon).then((function(_this) {
      return function(canvas) {
        const args = [canvas, constants.ICON_TYPE];
        switch (options.type) {
          case 'base64':
            return _this._toBase64.apply(_this, args);
          case 'blob':
            return _this._toBlob.apply(_this, args);
          default:
            throw new Error('Unsupported icon result type');
        }
      };
    })(this));
  }
});
