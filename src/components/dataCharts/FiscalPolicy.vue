<template>
  <div>
    <Chart
      :title="ChartTitle"
      xKey="time"
      yKey="value"
      :source="source"
      :data="ChartData"
      :info="ChartInfo"
      :xFormat="xFormat"
    />
  </div>
</template>

<script>
import Chart from "../charts/AnimatedLineChart";
import { json } from "d3-fetch";
import { timeParse } from "d3-time-format";
import { max, maxIndex, min, minIndex, bisector } from "d3-array";
import { fredUnits, template } from "../functions/d3-max";
import { format } from "d3-format";
//PCEPI
const apiKey = "f03c8ce7f9abbc474ccb57117ac26c86"; //GOOD THING I AM NOT PUBLICALLY HOSTING THIS ON GITHUB, OTHERWISE THIS WOULD BE PRETTY DUMB
const set1 = "PAYEMS";
const fUnits = "lin";
const start = "1940-01-01"; //YYYY-MM-DD
const parseTime = timeParse("%Y-%m-%d");
const parseRecessions = timeParse("%Y - %m - %d");

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

//const end = "2020-05-01"
function dataSeries(set) {
  return `https://api.stlouisfed.org/fred/series/observations?series_id=${set}&api_key=${apiKey}&observation_start=${start}&units=${fUnits}&file_type=json`;
}

function dataInfo(set) {
  return `https://api.stlouisfed.org/fred/series?series_id=${set}&api_key=${apiKey}&observation_start=${start}&units=${fUnits}&file_type=json`;
}

export default {
  name: "FiscalPolicy",
  data: () => ({
    source: "See FRED (Federal Reserve St. Louis, 2020)",
    ChartTitle: "",
    ChartData: [],
    ChartInfo: {},
    xFormat() {
      return format(",.0f")
    },
  }),
  mounted() {
    let recessionsTrough = [
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
      "",
    ];

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

    let recessionsObj = [];
    recessionsTrough.forEach((element, index) => {
      recessionsObj.push({
        trough: recessionsTrough[index],
        peak: recessionsPeak[index],
        key: recessionsPeak[index].split("-")[0],
      });
    });

    Promise.all([json(dataSeries(set1)), json(dataInfo(set1))])
      .then((responses) => {
        let dataSet = [];
        let values = responses[0].observations;
        let splicedValues = [];

        let popBisector = bisector((d) => {
          return d.date;
        }).right;

        recessionsObj[recessionsObj.length - 1].trough =
          values[values.length - 1].date;

        //Define indexTrough
        recessionsObj.forEach((recession, index) => {
          let indexTrough = values
            .map((element) => {
              return element.date;
            })
            .indexOf(recession.trough);

          recession.indexTrough = indexTrough;
        });

        //Use indexTrough
        recessionsObj.forEach((recession, index) => {
          if (index == 0) {
            let slice = values.slice(0, recessionsObj[index + 1].indexTrough);

            splicedValues.push({
              key: recession.key,
              values: slice,
            });
          } else {
            let slice;

            if (index + 1 < recessionsObj.length) {
              slice = values.slice(
                recessionsObj[index].indexTrough,
                recessionsObj[index + 1].indexTrough
              );
            } else {
              slice = values.slice(
                recessionsObj[index].indexTrough,
                values.length
              );
            }

            let priorValues = splicedValues[index - 1].values,
              priorMaxIndex = maxIndex(priorValues, (d) => {
                return d.value;
              }),
              priorMax = splicedValues[index - 1].values[priorMaxIndex].value,
              priorDate = splicedValues[index - 1].values[priorMaxIndex].date;

            let popStartIndex = values
              .map((value) => {
                return value.date;
              })
              .indexOf(priorDate);

            let recovIndex = minIndex(slice, (d) => {
              return Math.abs(d.value - priorMax);
            });

            let popEndIndex;
            if (!slice[recovIndex]) {
              popEndIndex = values.length;
            } else {
              popEndIndex = values
                .map((value) => {
                  return value.date;
                })
                .indexOf(slice[recovIndex].date);
            }

            splicedValues.push({
              key: recession.key,
              priorKey: splicedValues[index - 1].key,
              priorMax,
              priorDate,

              values: slice,
              popStartIndex,
              popEndIndex,
            });
          }
        });

        //console.log(splicedValues);

        let recessionIndex = 1;
        splicedValues.forEach((element, index) => {
          if (index == 0) {
            return;
          }
          if (element.key == 1990) {
            return;
          }

          let slice = values.slice(element.popStartIndex, element.popEndIndex);

          console.log("key: ", element.key, slice);
          slice.forEach((sliceValues) => {
            dataSet.push({
              value: (sliceValues.value-element.priorMax)/element.priorMax,
              time: dateDiffInDays(parseTime(element.priorDate), parseTime(sliceValues.date)),
              key: element.key,
            });
          });
        });

        console.log(dataSet)
        this.ChartTitle = "Job losses during post-war recessions";
        this.ChartData = dataSet;
      })
      .catch((error) => {
        console.warn(error);
      });
  },
  components: {
    Chart,
  },
};
</script>
