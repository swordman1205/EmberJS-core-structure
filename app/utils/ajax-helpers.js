import { keys } from 'ember-platform';
import fetch from 'ember-network/fetch';
import $ from 'jquery';
import config from 'dekko-frontend/config/environment';

export function ajaxFormData(url, data, success, error, token) {
    var hash = {};
    hash.url = url;
    hash.type = "POST";
    hash.data = data;

    hash.processData = false,  // tell jQuery not to process the data
    hash.contentType = false,  // tell jQuery not to set contentType
    hash.success = success;
    hash.error = error;

    if (token) {
      var headers = { 'RequestVerificationToken': token };

      hash.beforeSend = function (xhr) {
        keys(headers).forEach(function (key) {
          xhr.setRequestHeader(key, headers[key]);
        });
      };
    }

    $.ajax(hash);
}

function ajaxPostHelper(url, data, success, error) {
  const fullURL = [config.APP.host, url].join('/');

  fetch(fullURL, {
    method: 'POST',
    xhrFields: {
      withCredentials: true
    },
    data: data,
  })
  .then(success)
  .catch(error);
}

export function deleteSummary(data, success, error) {
  ajaxPostHelper('Mail/DeleteSummary', data, success, error)
}

export function mailRevoke(data, success, error) {
  ajaxPostHelper('Mail/Revoke', data, success, error)
}

export function indexDocument(data, success, error) {
  ajaxPostHelper('Mail/IndexDocument', data, success, error)
}
