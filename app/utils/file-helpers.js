/* globals Uint8Array */

export default function base64toBlob(base64Str, contentType, sliceSize) {
  let byteNumbers;
  let i;
  let slice;

  const byteChars = atob(base64Str);
  const byteArrays = [];

  contentType = contentType   || '';
  sliceSize   = sliceSize     || 512;

  for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
    slice = byteChars.slice(offset, offset + sliceSize);
    byteNumbers = new Array(slice.length);

    for (i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}
