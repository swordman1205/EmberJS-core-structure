// RM_TODO refactor
import { sessionStorageGet } from './crypto-helpers';

export function getCookieItem(name) {
  if (sessionStorageGet("cookie") === 'logout') {
    return;
  }

  let version = document.cookie.split(';');
  let index = -1;

  version.forEach(function (item, i) {
    if (item.indexOf(name) >= 0) {
      index = i;
    }
  });

  if (index >= 0) {
    return version[index].split('=')[1];
  } else if (sessionStorageGet("cookie") !== null) {
    version = sessionStorageGet("cookie").split(';');

    version.forEach(function (item, i) {
      if (item.indexOf(name) >= 0) {
        index = i;
      }
    });

    if (index >= 0) {
      return version[index].split('=')[1];
    } else {
      return;
    }
  } else {
    return;
  }
}

export function getUserNameFromCookie() {
  return getCookieItem('userName');
}

export function getVersionFromCookie() {
  return getCookieItem('currentVersion');
}

export function parseCookie(cookie) {
  const hash = {};

  if (!cookie) {
    return hash;
  }

  cookie.split(/;\s*/).forEach(function (p) {
    var match = p.match(/(\w+)=(\w+)/);

    if (match) {
      hash[match[1]] = match[2];
    }
  });

  return hash;
}
