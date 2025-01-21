import { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function generateRandomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

export function minutesToHM(d) {
    d = Number(d);
    var h = Math.floor(d / 60);
    var m = Math.floor(d % 60);
    var hDisplay = h > 0 ? h + (h === 1 ? " hr " : " hrs ") : "";
    var mDisplay = m > 0 ? m + (m === 1 ? " min " : " mins ") : "";
    return hDisplay + mDisplay;
}

export function secondsToHMS(d) {
  
  d = Number(d);
  
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  if (h === 0) {
    h = '00';
  } else if (h < 10) {
    h = '0' + h;
  }
  if (m === 0) {
    m = '00';
  } else if (m < 10) {
    m = '0' + m;
  }
  if (s === 0) {
    s = '00';
  } else if (s < 10) {
    s = '0' + s;
  }

  if (h === '00') {
    return m + ":" + s;
  } else {
    return h + ":" + m + ":" + s;
  }
  
}

export function timeSince(date) {

  if (typeof date !== 'object') {
    date = new Date(date);
  }

  var seconds = Math.floor((new Date() - date) / 1000);
  var intervalType;

  var interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    intervalType = 'y';
  } else {
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      intervalType = 'm';
    } else {
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) {
        intervalType = 'd';
      } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          intervalType = "h";
        } else {
          interval = Math.floor(seconds / 60);
          if (interval >= 1) {
            intervalType = "m";
          } else {
            interval = seconds;
            intervalType = "now";
          }
        }
      }
    }
  }

  // if (interval > 1 || interval === 0) {
  //   intervalType += 's';
  // }

  return interval + '' + intervalType;
};

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

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => window.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
};

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
  window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowDimensions;
};

export function getSubDomain(h) {
  let parts = h.split(".");
  let subdomain = 'none';
  if (parts.length === 1) { // localhost:3000
    subdomain = 'none';
  }
  if (parts.length === 2) { // www.localhost:3000 or hello.localhost:3000 or nikos.ai
    if (parts[1] === 'localhost:3000') {
      if (parts[0] !== 'www') {
        subdomain = parts[0];
      } else {
        subdomain = 'none';
      }
    } else {
      subdomain = 'none';
    }
  }
  if (parts.length === 3) { // www.nikos.ai or hello.nikos.ai
    if (parts[0] === 'www') {
      subdomain = 'none';
    } else {
      subdomain = parts[0];
    }
  }
  return subdomain;
}

export function convertToSlug(t) {
  return t.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

export function getMonthYearFromDate(date) {
  var d = new Date(date);
  var mon = monthNames[d.getMonth()];
  var yr = d.getFullYear();
  return mon + " " + yr;
}

