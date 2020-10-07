<template>
  <div>
    <Chart
      xKey="date"
      yKey="value"
      title="Fiscal Firepower"
      :info="ChartInfo"
      source="See FRED (Federal Reserve St. Louis, 2020)"
      chartNote="Government Current Expenditures % Change From Last Year"
      xAxisNote="Quarterly Data"
      :data="ChartData"
      :xTicks="xTicks"
      :xSpecial="recessionsObj"
    />
  </div>
</template>

<script>
import Chart from "../charts/LineChart.vue";
import { json } from "d3-fetch";
import { timeParse } from "d3-time-format";
import { fredUnits, template } from "../functions/d3-max";
import { timeFormat } from "d3-time-format";
import { timeMonth } from "d3-time";

import recessionsObj from "../functions/recessionDates";
recessionsObj.splice(0,recessionsObj.length-2);

const apiKey = "f03c8ce7f9abbc474ccb57117ac26c86"; //GOOD THING I AM NOT PUBLICALLY HOSTING THIS ON GITHUB, OTHERWISE THIS WOULD BE PRETTY DUMB
const set1 = "FGEXPND";
const set2 = "PCEC";
const fUnits = "pc1";
const start = "2007-03-01"; //YYYY-MM-DD
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
  name: "FiscalPolicy",
  data: () => ({
    ChartData: [],
    ChartInfo: {},
    xTicks: {
      interval: timeMonth.every(12),
      format: timeFormat("%b - %y"),
    },
    recessionsObj: recessionsObj,
  }),
  mounted() {
    Promise.all([json(dataInfo(set1)), json(dataSeries(set1))])
      .then((response) => {
        let { notes, last_updated, id, units, title } = response[0].seriess[0];
        let dataSet = [];

        last_updated = parseTime(last_updated.split(" ")[0]);
        if (units) {
          units = fredUnits[fUnits] + " of " + units;
        }

        response[1].observations.forEach((element) => {
          dataSet.push({
            date: parseTime(element.date),
            value: +element.value,
          });
        });

        this.ChartTitle = title;
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
