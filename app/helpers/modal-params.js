import { helper } from 'ember-helper';
import EmObject from 'ember-object';
import { isBlank } from 'ember-utils';

function queryParams(values) {
  return EmObject.create({
    isQueryParams: true,
    values,
  });
}

function isBlankObject(hash) {
  return isBlank(hash) || Object.keys(hash).length === 0;
}

export function modalParams(params, hash) {
  if (params.length === 0) {
    return queryParams({
      modal: null,
      modalParams: null,
    });
  }

  const modal = isBlank(params[0]) ? null : params[0].replace(/\//g, '.');
  const modalParams = isBlankObject(hash) ? null : btoa(JSON.stringify(hash));
  return queryParams({ modal, modalParams });
}

export default helper(modalParams);
