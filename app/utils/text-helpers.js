export function addSignature(app, message) {
    // get signature value.
  var signature = app.get('model.signature');

  if (!!signature) {
    // replace newlines in signature with proper line breaks.
    message = message + "<br><br>" + signature.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }

  return message;
}

export function subjectPreview(str) {
  str = str || '';
  // Trim in case resulted subject is bigger then 50 characters.
  return str.length > 50 ? str.substring(0, 50) + '...' : str;
}
