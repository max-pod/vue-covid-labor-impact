import { timeParse } from "d3-time-format";
const parseDate = timeParse("%Y-%m-%d");

const recessionsPeak = [
  "1937-05-01",
  "1945-02-01",
  "1948-11-01",
  "1953-07-01",
  "1957-08-01",
  "1960-04-01",
  "1969-12-01",
  "1973-11-01",
  "1980-01-01",
  "1981-07-01",
  "1990-07-01",
  "2001-03-01",
  "2007-12-01",
  "2020-02-01",
];

const recessionsTrough = [
  "1938-06-01",
  "1945-10-01",
  "1949-10-01",
  "1954-05-01",
  "1958-04-01",
  "1961-02-01",
  "1970-11-01",
  "1975-03-01",
  "1980-07-01",
  "1982-11-01",
  "1991-03-01",
  "2001-11-01",
  "2009-06-01",
  "2020-12-01",
  ];

  let recessionsObj = [];
  recessionsTrough.forEach((e, index) => {
    //console.log("THE RECESSION TROUGH")
    recessionsObj.push({
      troughDate: parseDate(recessionsTrough[index]),
      peakDate: parseDate(recessionsPeak[index]),
      trough: recessionsTrough[index],
      peak: recessionsPeak[index],
      key: recessionsPeak[index].split("-")[0],
    });
  });

//  console.log("FULL RECESSIONSOBJ",recessionsObj, recessionsTrough, recessionsPeak)

  export default recessionsObj
