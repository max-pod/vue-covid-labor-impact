<template>
  <div>
    <Chart
      title="Spending Across Income Categories"
      xKey="date"
      yKey="value"
      source="Sourced from FRED"
      chartNote="% Change"
      xAxisNote="Weekly Data"
      :data="ChartData"
      :info="ChartInfo"
      :legendMax="1"
      :xSpecial="recessionsObj"
      :ySpecial="[0]"
      :colors="['#009193','#00BE91','#5B9BD5','#5C5ED6']"
    />
  </div>
</template>

<script>
import Chart from "../charts/MultiLineChart.vue";
import { json } from "d3-fetch";
import { timeParse } from "d3-time-format";
import { fredUnits, template } from "../functions/d3-max";

import recessionsObj from "../functions/recessionDates";
let recessions = recessionsObj.slice(recessionsObj.length-2);

const apiKey = "f03c8ce7f9abbc474ccb57117ac26c86"; //GOOD THING I AM NOT PUBLICALLY HOSTING THIS ON GITHUB, OTHERWISE THIS WOULD BE PRETTY DUMB
const set1 = "HBFRGDQ188S";
const set2 = "PCEC";
const fUnits = "pc1";
const start = "2018-03-01"; //YYYY-MM-DD
const parseTime = timeParse("%Y-%m-%d");
const parseLastUpdated = timeParse("%Y-%m-%d");

//const end = "2020-05-01"
function dataSeries(set) {
  return `https://api.stlouisfed.org/fred/series/observations?series_id=${set}&api_key=${apiKey}&observation_start=${start}&units=${fUnits}&file_type=json`;
}

function dataInfo(set) {
  return `https://api.stlouisfed.org/fred/series?series_id=${set}&api_key=${apiKey}&observation_start=${start}&units=${fUnits}&file_type=json`;
}

export default {
  name: "TestMulti",
  data: () => ({
    source: "See FRED (Federal Reserve St. Louis, 2020)",
    ChartData: [],
    ChartInfo: {},
    recessionsObj: recessions,
  }),
  mounted() {
    let sets = [set1, set2];

    let promiseArray = [];
    sets.forEach((set) => {promiseArray.push(json(dataSeries(set)));})

    Promise.all([... promiseArray])
      .then((responses) => {
        let dataSet = [];

        for (let x in responses) {
            for (let y in responses[x].observations) {
                dataSet.push({date: parseTime(responses[x].observations[y].date), value: +responses[x].observations[y].value, key: sets[x]})
            }
        }
        console.log("Dataset: ", dataSet)
        this.ChartTitle = "Random Chart";
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
