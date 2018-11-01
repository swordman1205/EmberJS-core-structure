import Service from 'ember-service';
import { A } from 'ember-array/utils';

export default Service.extend({
  cache: A([]),

  invalidate(model, type) {
    const cache = this.get('cache');

    if (model in cache && type in cache[model]) {
      cache[model][type] = [];
    }
  },

  set(model, query, data) {
    if (!(model in this.cache)) {
      this.cache[model] = [];
    }

    if (!(query.type in this.cache[model])) {
      this.cache[model][query.type] = [];
    }

    this.cache[model][query.type][query.skip] = { data: data, date: Date.now() };
  },

  isValid(cacheLine) {
    return !!cacheLine && (Date.now() - cacheLine.date < 10 * 60 * 1000);
  },

  get(model, query) {
    if (model in this.cache && query.type in this.cache[model] && query.skip in this.cache[model][query.type]) {
      var cacheLine = this.cache[model][query.type][query.skip];

      if (this.isValid(cacheLine)) {
        return cacheLine.data;
      }
    }
  }
});
