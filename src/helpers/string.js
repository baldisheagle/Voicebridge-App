export function generateRandomString(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateRandomNumberCode(length) {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function getDomainFromEmail(email) {
  return email.substring(email.lastIndexOf("@") +1);
}

export function hexEncode(str) {
  var hex, i;
  var result = "";
  for (i = 0; i < str.length; i++) {
      hex = str.charCodeAt(i).toString(16);
      result += ("000"+hex).slice(-4);
  }
  return result
}

export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export function validateUrl(url) {
  var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  if (url !== null && url.match(regex)) {
    return true
  } else {
    return false
  }
}

export const extractDomain = (url) => {
  try {
    // Use the URL constructor to parse the URL
    const parsedUrl = new URL(url);
    // Extract the hostname and remove 'www.' if present
    let domain = parsedUrl.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch (error) {
    // Handle invalid URLs
    console.error('Invalid URL:', error);
    return null;
  }
}

export function getFirstName(str) {
  let words = str.split(" ")
  return(words[0])
}

export function getLastName(str) {
  let words = str.split(" ")
  return(words[words.length - 1]);
}

export function numberWithCommas(x) {
  if (x !== undefined) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return x
  }
}

export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
