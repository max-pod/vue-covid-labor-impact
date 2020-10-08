<template>
  <div>
    <Chart
      title="Math Achievements By Income"
      xKey="date"
      yKey="value"
      source="Online Data from Zearn. See TrackTheRecovery.org"
      chartNote="% Change"
      xAxisNote="Schools' Cumulative Math Achievements Based on ZIP Income"
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
      "https://raw.githubusercontent.com/OpportunityInsights/EconomicTracker/main/data/Zearn%20-%20National%20-%20Weekly.csv",
    ];
    let keys = [
      {full: "badges_inclow", name: "Low Income"},
      {full: "badges_incmiddle", name: "Moderate Income"},
      {full: "badges_inchigh", name: "High Income"},
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
            keys.forEach((key) => {
              let date = new Date()
              if (element.year == "2019") return;

              date.setFullYear(element.year)
              date.setMonth(element.month)
              date.setDate(element.day_endofweek)

              let value;
              isNaN(+element[key.full])? value = +element["break_"+key.full] : value = +element[key.full]

              //console.log(value, key.full, date)
              dataSet.push({
                date: date,
                value: +element[key.full],
                key: key.name,
              });
            });
          });
        }
        this.ChartData = dataSet;
        //console.log("dataSet: ",dataSet)
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
