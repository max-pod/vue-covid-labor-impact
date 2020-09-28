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
import Chart from "../charts/LineChart.vue";
import { json } from "d3-fetch";
import { timeParse } from "d3-time-format";
//PCEPI
const apiKey = "f03c8ce7f9abbc474ccb57117ac26c86"; //GOOD THING I AM NOT PUBLICALLY HOSTING THIS ON GITHUB, OTHERWISE THIS WOULD BE PRETTY DUMB
const set = "GDPC1";
const units = "pc1";
const start = "2018-03-01"; //YYYY-MM-DD
const parseTime = timeParse("%Y-%m-%d");
const parseLastUpdated = timeParse("%Y-%m-%d")

//const end = "2020-05-01"
let dataSeries = `https://api.stlouisfed.org/fred/series/observations?series_id=${set}&api_key=${apiKey}&observation_start=${start}&units=${units}&file_type=json`;
let dataInfo = `https://api.stlouisfed.org/fred/series?series_id=${set}&api_key=${apiKey}&observation_start=${start}&units=${units}&file_type=json`;

export default {
  name: "UnemploymentCombined",
  data: () => ({
    source: "See FRED (Federal Reserve St. Louis, 2020)",
    ChartTitle: "",
    ChartData: [],
    ChartInfo: {},
  }),
  mounted() {
    // d3.csv(
    //   "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered.csv"
    // ).then((response) => {
    //   console.log(response);
    // });
      json(dataInfo).then((response) => {
        console.log(response.seriess[0]);    
        let {notes, last_updated, id, units, title} = response.seriess[0]

        this.ChartTitle = title;

        last_updated = parseTime(last_updated.split(" ")[0])
        console.log("last_updated", last_updated)
        this.ChartInfo = {notes, last_updated, id, units};
      })
      
      let dataSet=[];

      json(dataSeries).then((response) => {
        console.log(response);
        response.observations.forEach(element => {
          dataSet.push({date: parseTime(element.date), value: +element.value})
        });
        
        this.ChartData = dataSet;
      })
  },
  components: {
    Chart,
  },
};
</script>
