<template>
  <div>
    <Chart
      title="Jobs Postings By Education"
      xKey="date"
      yKey="value"
      source="Sourced from Burning Glass Technologies. See TrackTheRecovery.org"
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
      "https://raw.githubusercontent.com/OpportunityInsights/EconomicTracker/main/data/Burning%20Glass%20-%20National%20-%20Weekly.csv",
    ];
    let keys = [
      {full: "bg_posts_jzgrp12", name: "Low Level"},
      {full: "bg_posts_jzgrp345", name: "High Level"},
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
            // if (element.emp_combined==".") {
            //   return;
            // }

            keys.forEach((key) => {
              let date = new Date()
              date.setFullYear(element.year)
              date.setMonth(element.month)
              date.setDate(element.day_endofweek)

              dataSet.push({
                date: date,
                value: +element[key.full],
                key: key.name,
              });
            });
          });
        }
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
