<template>
  <Chart
    xKey="time"
    yKey="value"
    :title="ChartTitle"
    :info="ChartInfo"
    :source="source"
    :chartNote="chartNote"
    :xAxisNote="xAxisNote"
    :data="ChartData"
    :xFormat="xFormat"
  />
</template>

<script>
import Chart from "../charts/AnimatedLineChart";

import { json } from "d3-fetch";
import { timeParse } from "d3-time-format";
import { max, maxIndex, min, minIndex, bisector } from "d3-array";
import { fredUnits, template } from "../functions/d3-max";
import { format } from "d3-format";

import recessionsObj from "../functions/recessionDates";

//PCEPI
const apiKey = "f03c8ce7f9abbc474ccb57117ac26c86"; //GOOD THING I AM NOT PUBLICALLY HOSTING THIS ON GITHUB, OTHERWISE THIS WOULD BE PRETTY DUMB
const set1 = "HOANBS";
const fUnits = "";
const start = "1940-01-01"; //YYYY-MM-DD
const parseTime = timeParse("%Y-%m-%d");
const parseRecessions = timeParse("%Y - %m - %d");

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function dataSeries(set) {
  return `https://cors-anywhere.herokuapp.com/https://api.stlouisfed.org/fred/series/observations?series_id=${set}&api_key=${apiKey}&observation_start=${start}&units=${fUnits}&file_type=json`;
}

function dataInfo(set) {
  return `https://cors-anywhere.herokuapp.com/https://api.stlouisfed.org/fred/series?series_id=${set}&api_key=${apiKey}&observation_start=${start}&units=${fUnits}&file_type=json`;
}

export default {
  name: "UniqueImpact",
  data: () => ({
    source: "See FRED (Federal Reserve St. Louis, 2020)",
    chartNote: "% Change Total Non-Farm Hours Worked Compared to Prior Peak",
    xAxisNote: "Days Until Recovered",
    ChartTitle: "Losses of Hours Worked During Post-War Recessions",
    recessionsObj: recessionsObj,
    ChartData: [],
    ChartInfo: {},
    xFormat() {
      return format(",.0f")
    },
  }),
  mounted() {
    Promise.all([json(dataSeries(set1)), json(dataInfo(set1))])
      .then((responses) => {
        let dataSet = [];
        let values = responses[0].observations;
        let splicedValues = [];

        //Define a Bisector Function
        const recessionBisector = bisector((d) => {
          return d.peak
        }).left;

        const observation_start = responses[1].seriess[0].observation_start;
        const closestRecession = recessionBisector(this.recessionsObj, observation_start, 1 )

        //Grab Only the Necessary Recession Dates
        let recessionsObj = this.recessionsObj.slice(closestRecession);
        recessionsObj[recessionsObj.length - 1].trough =
          values[values.length - 1].date;

        //Define a Bisector Function
        const dateBisector = bisector((d) => {
          return d.date
        }).right;

        //Define indexTrough
        recessionsObj.forEach((recession, index) => {
          let indexTrough = dateBisector(values, recession.trough, 1)-1;
          let indexPeak = dateBisector(values, recession.peak, 1)-1;
          recession.indexTrough = indexTrough;
          recession.indexPeak = indexPeak;
          //console.log("key", recession.key, "closet trough at: ", values[indexTrough].date,"to ", recession.trough)
        });

        //Define a Bisector Function
        const valueBisector = bisector((d) => {
          return d.value
        }).left;

        console.log(recessionsObj)


        //Use indexTrough
        recessionsObj.forEach((recession, index) => {
          let start;
          (index == 0)? start = 0 : start = recessionsObj[index-1].indexTrough;
          let slice = values.slice(start, recession.indexTrough+1)

          let sliceMaxIndex = maxIndex(slice, (d) => {
            return +d.value;
          });

          let sliceMaxObj = slice[sliceMaxIndex];

          let end;
          (index != recessionsObj.length-1)? end = recessionsObj[index+1].indexPeak: end = values.length;

          console.log(sliceMaxIndex, start, sliceMaxIndex+start,recession.indexPeak);

          let nextSlice = values.slice(sliceMaxIndex+start,end+1);
          
          let recoveryIndex
          (index != recessionsObj.length-1)? recoveryIndex = valueBisector(nextSlice, sliceMaxObj.value, 1): recoveryIndex = nextSlice.length;
          
          let recoverySlice = nextSlice.slice(0, recoveryIndex+1)
          
          //console.log("recovery Index", recoveryIndex);
          //console.log("recovery Slice", recoverySlice);
          console.log("next slice recovery", nextSlice[recoveryIndex-1], recoveryIndex, nextSlice.length, nextSlice)

          splicedValues.push({
            key: recession.key,
            slice,
            recoverySlice,
            sliceMaxVal: sliceMaxObj.value,
            sliceMaxDate: sliceMaxObj.date,
            recoveryVal: nextSlice[recoveryIndex-1].value,
            recoveryDate: nextSlice[recoveryIndex-1].date,
            timeToRecover: dateDiffInDays(parseTime(sliceMaxObj.date), parseTime(nextSlice[recoveryIndex-1].date))
          })

          //console.log("key", recession.key, "Between: ",values[start].date,"-",values[recession.indexTrough].date,"highest val: ",sliceMaxObj.value,"on: ",sliceMaxObj.date, slice)
          //console.log("key", recession.key, "End", recession.indexPeak, values.slice(recession.indexPeak,end+1))
        })

        console.log("spliceTest", splicedValues)

        splicedValues.forEach((element, index) => {

          let key = element.key;
          let slice = element.recoverySlice;
          let max = element.sliceMaxVal;
          let maxDate = element.sliceMaxDate

          slice.forEach((sliceValues) => {
            dataSet.push({
              value: (sliceValues.value-max)/max,
              time: dateDiffInDays(parseTime(maxDate), parseTime(sliceValues.date)),
              key: key,
            });
          });
        });

        let { notes, last_updated, id, units, title } = responses[1].seriess[0];
        last_updated = parseTime(last_updated.split(" ")[0]);

        this.ChartInfo = { notes, last_updated, id, units };
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
