/* globals Uint8Array, Uint16Array, docx, xlsx, PDFJS */

import RSVP from 'rsvp';
import sjcl from 'sjcl';
import $ from 'jquery';
import _ from 'lodash';
import combineArrayBuffers from './array-buffer-helpers';
import { hashStr } from './crypto-helpers';
import { indexDocument } from './ajax-helpers';

const MIME_TYPES = [
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/pdf"
];

const EXTENSIONS = [
  'docx',
  'xlsx'
];

export function indexDiscussion(app, summary, discussion) {
  var unreadReplies = discussion.get('replies').filterBy('isUnread');

  if (unreadReplies.get('length')) {
    const promises = unreadReplies.map(function (reply) {
      return reply.save();
    });

    return RSVP.all(promises).then(function() {
      if (summary) {
        summary.set('isInboxUnread', false);
      }

      unreadReplies.setEach('isUnread', false);
      app.get('model').reload();
    });
  }
  else {
    return new RSVP.Promise(function (resolve) {
      resolve(null);
    });
  }
}

export function tryIndexDocument(doc, buffer) {
  indexDocumentKeywords(doc, buffer, function (keywords) {
    const id = doc.get('id');

    indexDocument({
      id,
      keywords
    }, function () {
      doc.set('isReaded', true);
    }, function () {
    });
  });
}

function indexDocumentKeywords(doc, data, indexCallback) {
  var mimeType = doc.get('mimeType');
  var nameParts = doc.get('name').split('.');
  var extension = nameParts[nameParts.length - 1];
  var name = splitText(doc.get('name'));

  // Index content for up to 25 mb documents.
  if ((MIME_TYPES.includes(mimeType) || EXTENSIONS.includes(extension)) && doc.get('size') <= 26214400) {
    var dataCombined;

    try {
      dataCombined = combineArrayBuffers(data);
    }
    catch (exception) {
      splitOther(name, indexCallback);
      return;
    }

    if (mimeType === "text/plain") {
      splitTxt(dataCombined, name, indexCallback);
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || extension === 'docx') {
      splitDocx(dataCombined, name, indexCallback);
    }
    else if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || extension === 'xlsx') {
      splitXlsx(dataCombined, name, indexCallback);
    }
    else { // (mimeType === "application/pdf")
      splitPdf(dataCombined, name, indexCallback);
    }
  } else {
    splitOther(name, indexCallback);
  }
}

export function splitTxt(data, name, indexCallback) {
  try {
    // TODO: Hangle non utf data.
    let text;

    try{
      //UTF-8
      text = sjcl.codec.utf8String.fromBits((sjcl.codec.arrayBuffer.toBits(data)));
    }catch(e){
      //ASCII
      text = String.fromCharCode.apply(null, new Uint8Array(data));

      //Unicode
      if (text.indexOf(String.fromCharCode(0)) >= 0) {
        text = String.fromCharCode.apply(null, new Uint16Array(data));
      }
    }

    const body = splitText(text);
    indexCallback(hashStr(name, body));
  } catch(e) {
    indexCallback([]);
  }
}

export function splitDocx(data, name, indexCallback) {
  let body = [];
  data = sjcl.codec.base64.fromBits(sjcl.codec.arrayBuffer.toBits(data));

  if (data) {
    $(docx(data).DOM).each(function () {
      $(this).contents().each(function () {
        body.push(splitText($(this).text().replace(/(?:&nbsp;|\n)/, '')));
      });
    });

  }
  body = _.filter(_.flatten(body), function (piece) {
    return _.isString(piece) && piece.length;
  });

  const keywords = hashStr(name, body);
  indexCallback(keywords);
}

export function splitXlsx(data, name, indexCallback) {
  let body = [];
  let row;
  let worksheet;
  let worksheetData;
  data = sjcl.codec.base64.fromBits(sjcl.codec.arrayBuffer.toBits(data));
  const parsed = xlsx(data);

  for (let i = 0; i < parsed.worksheets.length; i++) {
    worksheet = parsed.worksheets[i];

    if (worksheet) {
      body.push(splitText(worksheet.name.replace(/(?:&nbsp;|\n)/, '')));
      worksheetData = worksheet.data;

      if (worksheetData) {
        for (let j = 0; j < worksheetData.length; j++) {
          row = worksheetData[j];

          if (row) {
            for (let k = 0; k < row.length; k++) {
              var cell = row[k];

              if (cell) {
                body.push(splitText(cell.value.toString().replace(/(?:&nbsp;|\n)/, '')));
              }
            }
          }
        }
      }
    }
  }

  body = _.filter(_.flatten(body), function (piece) {
    return _.isString(piece) && piece.length;
  });

  const keywords = hashStr(name, body);
  indexCallback(keywords);
}


function splitPdf(data, name, indexCallback) {
  var promise = PDFJS.getDocument(data);

  promise.then(function (pdf) {
    let body = [];
    let complete = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
      pdf.getPage(i).then(function (page) {
        page.getTextContent().then(function (textContent) {
          body[page.pageNumber] = splitText(_.reduce(textContent.items, function (content, block) {
            return content + block.str;
          }, ''));

          complete++;

          if (complete == pdf.numPages) {
            body = _.filter(_.flatten(body), function (piece) {
                return _.isString(piece) && piece.length;
            });

            const keywords = hashStr(name, body);
            indexCallback(keywords);
          }
        });
      });
    }
  });
}

export function splitOther(name, indexCallback) {
  const keywords = hashStr(name);
  indexCallback(keywords);
}

export function splitText(str) {
  if (_.isArray(str)) {
    return str;
  }

  return _.isString(str) ? str.toLowerCase().match(/\w+/g) || [] : [];
}
