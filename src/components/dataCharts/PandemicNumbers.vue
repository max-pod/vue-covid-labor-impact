<template>
  <div>
    <Chart
      title="New Case Count"
      xKey="date"
      yKey="value"
      source="Sourced from New York Times COVID-19 Repository. See TrackTheRecovery.org"
      chartNote="New Confirmed Cases, 7 Day Moving Avg"
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
  name: "PandemicNumbers",
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
      "https://raw.githubusercontent.com/OpportunityInsights/EconomicTracker/main/data/COVID%20-%20National%20-%20Daily.csv",
    ];
    let keys = [
      {full: "new_case_count", name: "Confirmed COVID-19 Cases"},
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

              if (isNaN(+element[key.full])) return;

              dataSet.push({
                date: date,
                value: +element[key.full],
                key: key.name,
              });
            });
          });
        }
        console.log("SPENDING BY INCOME: ", dataSet);
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
