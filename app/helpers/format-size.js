import { helper } from 'ember-helper';

const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; // YB definitely stands for 'You dont own this much space Byte.'

function formatSize([size]) {
  size = size || 0;

  // According to IEC_60027 this is wrong postfixes for data but people used to them.
  let i = 0;

  while (size > 1024) {
    size /= 1024;
    i++;
  }

  return size.toFixed(i === 0 || size % 1 === 0 ? 0 : 1) + ' ' + units[i];
}

export default helper(formatSize);
