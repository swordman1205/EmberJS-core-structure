import $ from 'jquery';
import _ from 'lodash';
import { A } from 'ember-array/utils';
import Select2 from 'dekko-frontend/pods/components/select-2/component';

export default Select2.extend({
  classNames: ['recipient'],
  modelName: 'user',
  nameProperty: 'name',

  configuration: function () {
    const obj = this._super();

    obj.formatSelection = function (data, container, escapeMarkup) {
      data.text = data.name;
      delete data.name;
      return $.fn.select2.defaults.formatSelection(data, container, escapeMarkup);
    };

    return obj;
  },

  transformItem: function (item) {
    if (_.isString(item)) {
      return { id: item, name: name, text: item };
    }

    const idProp = this.get('idProperty');
    const nameProp = this.get('nameProperty');
    const nicknameProp = this.get('nicknameProperty');

    const id = item.get ? item.get(idProp) : item[idProp];
    const name = item.get ? item.get(nameProp) : item[nameProp];
    const nickname = item.get ? item.get(nicknameProp) : item[nicknameProp];

    const text = name ? (`${name} ${(name !== nickname && nickname) ? ` (${nickname})`  : ''}`) : nickname;

    return {
      id,
      name: name ? name : nickname,
      text
    };
  },

  throttledModelsObserver: function () {
    return this.throttledObserver(this.get('idProperty'));
  },

  reduceModel: function () {
    const modelName = this.get('modelName');
    const loadedRecords = this.get('store').peekAll(modelName);
    const idProp = this.get('idProperty');

    return A(this.$().val().split(','))
      .reduce(function (memo, name) {
        const record = loadedRecords.findBy(idProp, name);

        if (record) {
          memo.push(record);
        }

        return memo;
      }, []);
  }
});
