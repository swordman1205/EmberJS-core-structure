/* globals ArrayBuffer, Uint8Array */

import sjcl from 'sjcl';
import ShadowKeychain from 'dekko-frontend/utils/shadow-keychain';

// ..........................................................
// Constants.
//
const IV_SIZE = 3; // 96 bits.
const KEY_SIZE = 8; // 256 bits.
const SALT_SIZE = 8; // 256 bits.
const ECC_CURVE_SIZE = 384; // ecc curve size.


/**
    Function that is used to generate proper metadata for login.
*/
export function loginTransformator(password) {
  // Hash password. We don't want to send plain password.
  return hash(sjcl.codec.utf8String.toBits(password));
}

/**
    Function that is used to generate proper metadata for registration.
*/
export function registerTransformator(data) {
  // Generate salt.
  const salt = generateSalt();

  // Generate iv.
  const iv = generateIV();

  // Generate keys automatically.
  const keys = sjcl.ecc.elGamal.generateKeys(ECC_CURVE_SIZE);

  // Persist private key.
  const privateKey = keys.sec._exponent.toString();

  // Derive aes key.
  const passwordData = sjcl.codec.utf8String.toBits(data.password);
  const key = deriveKeyFromPassword(passwordData, salt);

  // Set public keys.
  data.keyX = keys.pub._point.x.toString();
  data.keyY = keys.pub._point.y.toString();

  // Encrypt private key with generated (key,iv) pair.
  data.privateKeyData = dataToBase64(encryptString(key, privateKey, iv));
  data.privateKeySecurity = objectToBase64({ salt: dataToBase64(salt), iv: dataToBase64(iv) });

  // Hash password. We don't want to send plain password.
  data.passwordHash = hash(passwordData);

  // eliminate plain password.
  delete data.password;

  return data;
}

/**
    Function that is used to generate proper metadata for login.
*/
export function persistMetadata(metadata, password) {
  // extract publicly available security.
  const privateKeySecurity = base64ToObject(metadata.privateKeySecurity);

  // Derive aes key.
  const key = deriveKeyFromPassword(sjcl.codec.utf8String.toBits(password), base64ToData(privateKeySecurity.salt));

  // Decrypt private key.
  const privateKey = decryptString(key, base64ToData(metadata.privateKeyData), base64ToData(privateKeySecurity.iv));

  // Persist public keys.
  sessionStorageSave("publicKeys", new ShadowKeychain(metadata.publicKeyX, metadata.publicKeyY));

  // Persist private key.
  sessionStorageSave("privateKey", privateKey);

  // persist cookie
  sessionStorageSave("cookie", document.cookie);
  sessionStorageSave("KeyX",metadata.publicKeyX);
  sessionStorageSave("KeyY",metadata.publicKeyY);
}

/**
    Generate a an encrypted key with new password.
*/
export function generateNewEncryptionOfKey(password, privateKey) {
  // Generate salt.
  const salt = generateSalt();

  // Generate iv.
  const iv = generateIV();

  // Derive aes key.
  const key = deriveKeyFromPassword(sjcl.codec.utf8String.toBits(password), salt);

  return {
    privateKeyData: dataToBase64(encryptString(key, privateKey, iv)),
    privateKeySecurity: objectToBase64({ salt: dataToBase64(salt), iv: dataToBase64(iv) }),
  };
}

/**
    Sign a string hash using private key.
*/
export function sign(privateKey, str) {
  // For simplicity of namespace usage.
  const curve = sjcl.ecc.curves.c384;

  // Get private key point.
  const sec = new sjcl.ecc.ecdsa.secretKey(curve, new sjcl.bn(privateKey));

  // Sign string data.
  return sec.sign(str);
}

/**
    Encrypt user a key with given private key.
*/
export function encryptKey(publicKeyPair) {
  // Generate salt
  const salt = generateSalt();

  // Get symmetric keys based on metadata.
  const key = metadataSymmetricKey(salt, publicKeyPair);

  // Generate random noise iv.
  const iv = random(IV_SIZE);

  // Ecnrypt values
  const privateKey = sessionStorageGet("privateKey");

  // Ecnrypt values
  const encryptedKey = encryptString(key, privateKey, iv);

  return { data: encryptedKey, key, iv };
}

/**
    Generate a an encrypted key with new password.
*/
// export function generateKey2(newPassword, publicKeyX, publicKeyY, encryptedKey, salt, iv) {
//
//
//     var key = metadataSymmetricKey(oldSalt, new ShadowKeychain(publicKeyX, publicKeyY));
//
//     var privateKey = decrypt(symmetricKeys, oldEncryptedKey);
//
//     // Generate salt
//     var salt = generateSalt();
//
//     // Generate key from new salt and new password.
//     var symmetricKeys = deriveSymmetricKeys(newPassword, salt)
//
//     // encrypt key with new password.
//     var privateEncryptedKey = encrypt(symmetricKeys, privateKey);
//
//     // hash password.
//     var hashedPassword = hash(newPassword)
//
//     return { salt, hashedPassword, privateEncryptedKey };
// }

/**
    Ecnrypt data.
*/
export function encryptData(key, pt, iv) {
  return sjcl.mode.ccm.encrypt(new sjcl.cipher.aes(key), pt, iv);
}

/**
    Ecnrypt string.
*/
export function encryptString(key, pt, iv) {
  return encryptData(key, sjcl.codec.utf8String.toBits(pt), iv);
}

/**
    Decrypt data.
*/
export function decryptData(key, ct, iv) {
  return sjcl.mode.ccm.decrypt(new sjcl.cipher.aes(key), ct, iv);
}

/**
    Decrypt data.
*/
export function decryptString(key, ct, iv) {
  return sjcl.codec.utf8String.fromBits(decryptData(key, ct, iv));
}

/**
    Hash data.
*/
export function hash(data) {
  return dataToBase64(sjcl.hash.sha512.hash(data));
}

/**
    Dervie random key for symmetric aes cypher.
*/
export function deriveKeyFromSecret(secret, salt) {
  return deriveKey(secret, salt, 1000);
}

/**
    Dervie random key,iv pair for symmetric aes cypher.
*/
export function deriveKeyFromPassword(password, salt) {
  return deriveKey(password, salt, 4096);
}

export function deriveKey(password, salt, iterations) {
  return sjcl.misc.pbkdf2(password, salt, iterations, KEY_SIZE * 32, function (key) { return new sjcl.misc.hmac(key, sjcl.hash.sha1); });
}

/**
    Generate salt.
*/
export function generateSalt() {
  return random(SALT_SIZE);
}

/**
    Generate iv.
*/
export function generateIV() {
  return random(IV_SIZE);
}

/**
    Generate key.
*/
export function generateKey() {
  return random(KEY_SIZE);
}

/**
    Size is in words (32 bits)
    random(4) = 128
*/
export function random(size) {
  return sjcl.random.randomWords(size);
}

/**
    Function for generation symmetric keys based on metadata.
*/
export function metadataSymmetricKey(salt, keychain) {
  // frankly publicKeyX ought to be enough for anybody
  const key = keychain.get('keyX') + keychain.get('keyY');

  let secret = sessionStorageGet(key);

  // Get eliptic
  if (secret == null) {
    // For simplicity of namespace usage.
    const curve = sjcl.ecc.curves.c384;

    // Restore points and exponent.
    const pointX = new sjcl.bn(keychain.get('keyX'));
    const pointY = new sjcl.bn(keychain.get('keyY'));

    const exponent = new  sjcl.bn(sessionStorageGet("privateKey"));

    // Get publicKey point.
    const pub = new sjcl.ecc.basicKey.publicKey(curve, new sjcl.ecc.point(curve, pointX, pointY));

    // Get private key point.
    const sec = new sjcl.ecc.basicKey.secretKey(curve, exponent);

    // Calculate secret.
    // For bounty castle interoprability.
    const secretPoint = pub._point.mult(sec._exponent);

    // Hash secret.
    secret = sjcl.hash.sha256.hash(сoncatSecret(secretPoint.x.toString(), secretPoint.y.toString()));

    // cache multiplication.
    sessionStorageSave(key, secret);
  }

  // Generate pair.
  return deriveKeyFromSecret(secret, salt);
}

/**
    Concat both x and y secrets and make a byte[] array from them.
*/
export function сoncatSecret(stra, strb) {
  stra = stra.replace(/^0x/, '');
  strb = strb.replace(/^0x/, '');

  return sjcl.codec.utf8String.toBits(stra + strb);
}

/**
    Calculate hased keyword for search.
*/
export function hashSearch(str) {
  return hashOneString(str, sessionStorageGet("privateKey"));
}

/**
    Hash string with user private key.
*/
export function hashStr() {
  const privateKey = sessionStorageGet("privateKey");
  const keywords = new Array();

  for (let i = 0; i < arguments.length; i++) {
    for (let k = 0; k < arguments[i].length; k++) {
      keywords.push(hashOneString(arguments[i][k], privateKey));
    }
  }

  return keywords;
}

export function hashOneString(str, privateKey) {
  return hash(sjcl.codec.utf8String.toBits(str + privateKey));
}

/**
    Save complex object in session storage.
*/
export function sessionStorageSave(key, item) {
  sessionStorage.setItem(key, JSON.stringify(item));
}

/**
    Get complex object in session storage.
*/
export function sessionStorageGet(key) {
  return JSON.parse(sessionStorage.getItem(key));
}

/**
    Create key triplet.
*/
export function getPublicKeyPair() {
  return sessionStorageGet("publicKeys");
}

/**
    Decode a simple base64 encoded structure.
*/
export function decodePayload(data) {
  return JSON.parse(sjcl.codec.utf8String.fromBits(base64ToData(data)));
}

/**
    Decrypt javascript object.
*/
export function decryptPayload(publicKeyPair, data, security) {
  return JSON.parse(decryptPayloadString(publicKeyPair, data, security));
}

/**
    Encrypt javascript object.
*/
export function encryptPayload(publicKeyPair, data) {
  return encryptPayloadString(publicKeyPair, JSON.stringify(data));
}

/**
    Decrypt javascript payload string bject.
*/
export function decryptPayloadString(publicKeyPair, data, security) {
  // Restore json data object.
  security = base64ToObject(security);

  // Get data.
  data = base64ToData(data);

  // Dervie aes key from secret and salt.
  const keyKey = metadataSymmetricKey(base64ToData(security.salt), publicKeyPair);

  // Decrypt data key from secret.
  const key = decryptData(keyKey, base64ToData(security.key), base64ToData(security.keyIV));

  // Decrypted data.
  return decryptString(key, data, base64ToData(security.iv));
}

/**
    Encrypt javascript payload string object.
*/
export function encryptPayloadString(publicKeyPair, data) {
  // Generate iv.
  const iv = generateIV();

  // Generate aes key.
  const key = generateKey();

  // Ecnrypt user data.
  const payload = dataToBase64(encryptString(key, data, iv));

  // Generate salt.
  const keySalt = generateSalt();

  // Generate iv.
  const keyIV = generateIV();

  // Dervie aes key from secret and salt.
  const keyKey = metadataSymmetricKey(keySalt, publicKeyPair);

  // Encrypt data key from secret.
  const dataKey = encryptData(keyKey, key, keyIV);

  // create result pair.
  return {
    data: payload,
    security: objectToBase64({iv: dataToBase64(iv), keyIV: dataToBase64(keyIV), salt: dataToBase64(keySalt), key: dataToBase64(dataKey)})
  };
}

/**
    Decrypt javascript array object.
*/
export function decryptPayloadArrayAsync(publicKeyPair, security) {
  // Restore json data object.
  security = base64ToObject(security);

  // Dervie aes key from secret and salt.
  const keyKey = metadataSymmetricKey(base64ToData(security.salt), publicKeyPair);

  // Decrypt data key from secret.
  const key = decryptData(keyKey, base64ToData(security.key), base64ToData(security.keyIV));

  // Get iv.
  let iv = base64ToData(security.iv);

  // Create aes object.
  const aes = new sjcl.cipher.aes(key);

  const process = function (data) {
    var dataToDecrypt = sjcl.codec.arrayBuffer.toBits(data);
    var dataAfterDecryption = sjcl.mode.ccm.decrypt(aes, dataToDecrypt, iv);
    var dataToReturn = sjcl.codec.arrayBuffer.fromBits(dataAfterDecryption, false);

    // Get next iv.
    iv = dataToDecrypt.slice(dataToDecrypt.length - IV_SIZE);

    return dataToReturn;
  }

  return { process };
}

/**
    Encrypt javascript array object.
*/
export function encryptPayloadArrayAsync(publicKeyPair) {
  // Generate iv.
  let iv = generateIV();

  // Generate aes key.
  const key = generateKey();

  // Generate salt.
  const keySalt = generateSalt();

  // Generate iv.
  const keyIV = generateIV();

  // Dervie aes key from secret and salt.
  const keyKey = metadataSymmetricKey(keySalt, publicKeyPair);

  // Encrypt data key from secret.
  const dataKey = encryptData(keyKey, key, keyIV);

  // Create security object.
  const security = objectToBase64({ iv: dataToBase64(iv), keyIV: dataToBase64(keyIV), salt: dataToBase64(keySalt),  key: dataToBase64(dataKey) });

  // Create aes object.
  const aes = new sjcl.cipher.aes(key);

  // Create a processing routine that is called from array.
  const process = function (data) {
    const dataToEncrypt = sjcl.codec.arrayBuffer.toBits(data);
    const dataAfterEncryption = sjcl.mode.ccm.encrypt(aes, dataToEncrypt, iv); // Encrypt with aes/ccm mode

    iv = dataAfterEncryption.slice(dataAfterEncryption.length - IV_SIZE); // Get next iv.

    return sjcl.codec.arrayBuffer.fromBits(dataAfterEncryption, false);
  }

  // create result pair.
  return { process, contentSecurity: security };
}

/**
 * @param documentAttributeSecurity
 * @param documentOwnerKeychain
 * @param documentAccessorKeychain
 * @returns {*}
 */
export function createDocumentSecurity(doc, ownerKeychain, accessorKeychain) {
  return {
    id: doc.id,
    nameSecurity: adaptDocumentSecurity(doc.nameSecurity, ownerKeychain, accessorKeychain),
    contentSecurity: adaptDocumentSecurity(doc.contentSecurity, ownerKeychain, accessorKeychain)
  }
}


export function adaptDocumentSecurity(documentAttributeSecurity, documentOwnerKeychain, documentAccessorKeychain) {
  // Get security object.
  let security = base64ToObject(documentAttributeSecurity);

  // Dervie aes key from secret and salt.
  let keyKey = metadataSymmetricKey(base64ToData(security.salt), documentOwnerKeychain);

  // Decrypt data key from secret.
  const key = decryptData(keyKey, base64ToData(security.key), base64ToData(security.keyIV));

  // Generate salt.
  const salt = generateSalt();

  // Generate iv.
  const keyIV = generateIV();

  // Dervie aes key from secret and salt.
  keyKey = metadataSymmetricKey(salt, documentAccessorKeychain);

  // Encrypt data key from secret.
  const dataKey = encryptData(keyKey, key, keyIV);

  security = { iv: security.iv, keyIV: dataToBase64(keyIV), salt: dataToBase64(salt), key: dataToBase64(dataKey) };

  return objectToBase64(security)
}

/**
    Convert object to base64 string.
*/
export function objectToBase64(obj) {
  return dataToBase64(sjcl.codec.utf8String.toBits(JSON.stringify(obj)));
}


/**
    Convert data to base64 string.
*/
export function dataToBase64(data) {
  return sjcl.codec.base64.fromBits(data);
}

/**
    Create object from base64 string.
*/
export function base64ToObject(str) {
  return JSON.parse(sjcl.codec.utf8String.fromBits(base64ToData(str)));
}

/**
    Create object from base64 string.

*/
export function base64ToData(str) {
  return sjcl.codec.base64.toBits(str);
}


/**
    Slice data into 1024 * 1024 chunks.
*/
export function sliceArrayBufferToStrings(data) {
  const content = [];
  const chunk = 1024 * 1024;

  for (let i = 0, j = data.byteLength, k = 0; i < j; i += chunk, k++) {
    content[k] = arrayBufferToString(data.slice(i, i + chunk));
  }

  return content;
}

export function appendStringsToArrayBuffer(data) {
  let i;
  const buffers = [];

  for (i = 0; i < data.length; i++) {
    buffers[i] = stringToArrayBuffer(data[i]);
  }

  let bytes = 0;

  for (i = 0; i < buffers.length; i++) {
      bytes += buffers[i].byteLength;
  }

  const resultArrayBuffer = new ArrayBuffer(bytes);
  const result = new Uint8Array(resultArrayBuffer);

  let offset = 0;

  for (i = 0; i < buffers.length; i++) {
    result.set(new Uint8Array(buffers[i]), offset);
    offset += buffers[i].byteLength;
  }

  return resultArrayBuffer;
}


/**
    Convert array buffer to string.
*/
export function arrayBufferToString(buff) {
  let a;
  let b;
  let c;
  let d;
  let chunk;
  let base64 = '';

  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new Uint8Array(buff);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12;   // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6;      // 4032     = (2^6 - 1) << 6
    d = chunk & 63;               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }

  return base64;
}

/**
    Convert string to array buffer.
*/
export function stringToArrayBuffer(str) {
  let chr1;
  let chr2;
  let chr3;
  let enc1;
  let enc2;
  let enc3;
  let enc4;
  let bytes = (str.length / 4) * 3;
  const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  //get last chars to see if are valid
  const lkey1 = keyStr.indexOf(str.charAt(str.length - 1));
  const lkey2 = keyStr.indexOf(str.charAt(str.length - 2));

  if (lkey2 == 64) {
    bytes--; //padding chars, so skip
  }

  if (lkey1 == 64) {
    bytes--; //padding chars, so skip
  }

  let j = 0;

  const arrayBuffer = new ArrayBuffer(bytes);
  const uarray = new Uint8Array(arrayBuffer);

  str = str.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  for (let i = 0; i < bytes; i += 3) {
      //get the 3 octects in 4 ascii chars
      enc1 = keyStr.indexOf(str.charAt(j++));
      enc2 = keyStr.indexOf(str.charAt(j++));
      enc3 = keyStr.indexOf(str.charAt(j++));
      enc4 = keyStr.indexOf(str.charAt(j++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      uarray[i] = chr1;
      if (enc3 != 64) uarray[i + 1] = chr2;
      if (enc4 != 64) uarray[i + 2] = chr3;
  }

  return uarray;
}

/**
    Encrypt your private key string for a user array buffer.
*/
export function createTrustFromPrivateKey(publicKeyPair) {
  return encryptPayloadString(publicKeyPair, sessionStorageGet("privateKey"));
}

/**
    Create a proper login metadata from encrypted key.
*/
export function generateUserMetadataFromTrust(publicKeyPair, password, data, security) {
  // Generate salt.
  const salt = generateSalt();

  // Generate iv.
  const iv = generateIV();

  // Decrypt user's private key.
  const privateKey = decryptPayloadString(publicKeyPair, data, security);

  // Derive aes key.
  const passwordData = sjcl.codec.utf8String.toBits(password);
  const key = deriveKeyFromPassword(passwordData, salt);

  return {
    privateKeyData: dataToBase64(encryptString(key, privateKey, iv)),
    privateKeySecurity: objectToBase64({ salt: dataToBase64(salt), iv: dataToBase64(iv) }),
  };
}

/**
    Utility function to print byte data of string.
*/
String.prototype.getBytes = function () {
  const bytes = [];

  for (let i = 0; i < this.length; ++i) {
    bytes.push(this.charCodeAt(i));
  }

  return bytes;
};

export function sessionStorageLogOut() {
  sessionStorageSave('publicKeys', null);
  sessionStorageSave('privateKey', null);
  sessionStorageSave('cookie', 'logout');
}
