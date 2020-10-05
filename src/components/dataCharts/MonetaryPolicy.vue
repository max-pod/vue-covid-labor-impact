<template>
  <div>
    <Chart
      :title="ChartTitle"
      xKey="date"
      yKey="value"
      :source="source"
      :data="ChartData"
      :info="ChartInfo"
    />
  </div>
</template>

<script>
import Chart from "../charts/MultiLineChart.vue";
import { json } from "d3-fetch";
import { timeParse } from "d3-time-format";
import { fredUnits, template } from "../functions/d3-max";
//PCEPI
const apiKey = "f03c8ce7f9abbc474ccb57117ac26c86"; //GOOD THING I AM NOT PUBLICALLY HOSTING THIS ON GITHUB, OTHERWISE THIS WOULD BE PRETTY DUMB
const set1 = "GDPC1";
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
  name: "MonetaryPolicy",
  data: () => ({
    source: "See FRED (Federal Reserve St. Louis, 2020)",
    ChartTitle: "",
    ChartData: [],
    ChartInfo: {},
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
