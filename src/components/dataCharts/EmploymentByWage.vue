<template>
  <div>
    <Chart
      title="Employment Across Income Categories"
      xKey="date"
      yKey="value"
      source="Sourced from Paychex, Intuit, Earnin, and Kronos. See TrackTheRecovery.org"
      chartNote="% Change"
      xAxisNote="Weekly Data"
      :data="ChartData"
      :info="ChartInfo"
      :xTicks="xTicks"
      :yFormat="yFormat"
      :legendMax="1"
    />
  </div>
</template>

<script>
import Chart from "../charts/MultiLineChart.vue";
import { csv } from "d3-fetch";
import { format } from "d3-format";
import { timeParse } from "d3-time-format";
import { timeFormat } from "d3-time-format";
import { timeMonth } from "d3-time";

const start = "2018-03-01"; //YYYY-MM-DD
const parseTime = timeParse("%Y-%m-%d");
const parseLastUpdated = timeParse("%Y-%m-%d");

export default {
  name: "EmploymentByWage",
  data: () => ({
    ChartData: [],
    ChartInfo: {},
    xTicks: {
      interval: timeMonth.every(1),
      format: timeFormat("%b - %y"),
    },
    yFormat: format(",.2f"),
  }),
  mounted() {
    const sets = [
      "https://raw.githubusercontent.com/OpportunityInsights/EconomicTracker/main/data/Employment%20Combined%20-%20National%20-%20Daily.csv",
    ];
    let keys = [
      {full: "emp_combined_inclow", name: "Low Income"},
      {full: "emp_combined_incmiddle", name: "Middle Income"},
      {full: "emp_combined_inchigh", name: "High Income"},
    ];

    let promiseArray = [];
    sets.forEach((set) => {
      promiseArray.push(csv(set));
    });

    Promise.all([...promiseArray])
      .then((responses) => {
        console.log("responses", responses);
        let dataSet = [];

        for (let x in responses) {
          responses[x].forEach((element) => {
            if (element.emp_combined==".") {
              return;
            }

            keys.forEach((key) => {
              let date = new Date()
              date.setFullYear(element.year)
              date.setMonth(element.month)
              date.setDate(element.day)

              dataSet.push({
                date: date,
                value: +element[key.full],
                key: key.name,
              });
            });
          });
        }
        //console.log("Dataset: ", dataSet);
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
