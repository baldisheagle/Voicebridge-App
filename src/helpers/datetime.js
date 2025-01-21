const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function minutesToHM(d) {
    d = Number(d);
    var h = Math.floor(d / 60);
    var m = Math.floor(d % 60);
    var hDisplay = h > 0 ? h + (h === 1 ? " hr " : " hrs ") : "";
    var mDisplay = m > 0 ? m + (m === 1 ? " min " : " mins ") : "";
    return hDisplay + mDisplay;
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
  if (intervalType === 'now') {
    return intervalType
  } else {
    return interval + '' + intervalType;
  }
};

export function getMonthYearFromDate(date) {
    var d = new Date(date);
    var mon = monthNames[d.getMonth()];
    var yr = d.getFullYear();
    return mon + " " + yr;
}


export function getLast12Months() {
  const currentDate = new Date();
  let last12Months = [];
  for (let i = 0; i <= 11; i++) {
    let pastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    let month = pastDate.getMonth();
    let year = pastDate.getFullYear();
    last12Months.unshift(`${monthNames[month]} ${year}`);
  }
  return last12Months;
}

export function getGreeting() {
  var today = new Date()
  var curHr = today.getHours()
  
  if (curHr < 12) {
    return 'Good morning';
  } else if (curHr < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}
