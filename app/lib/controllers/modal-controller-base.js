import EmController from 'ember-controller';

export default EmController.extend({
  closeModal() {
    this.transitionToRoute({ queryParams: { modal: null, modalParams: null } });
  },

  setRecord(modelName, modelId) {
    return this.store.findRecord(modelName, modelId)
      .then(model => {
        this.set('model', model);
        return model;
      });
  },
});
