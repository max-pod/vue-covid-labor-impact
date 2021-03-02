<template>
  <div>
    <Chart
      title="Unemployment Gaps"
      xKey="date"
      yKey="value"
      source="Source: U.S. Bureau of Labor Statistics"
      chartNote=""
      xAxisNote=""
      :data="ChartData"
      :info="ChartInfo"
      :legendMax="1"
      :xSpecial="recessionsObj"
      :ySpecial="[]"
      :yFormat="yFormat"
      :colors="['#FF0000','#5B9BD5','#009193']"
    />
  </div>
</template>

<script>
import Chart from "../charts/MultiLineChart.vue";
import { json } from "d3-fetch";
import { timeParse } from "d3-time-format";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { timeMonth } from "d3-time";
import { fredUnits, template } from "../functions/d3-max";


import recessionsObj from "../functions/recessionDates";
let recessions = recessionsObj.slice(recessionsObj.length-2);

const apiKey = "f03c8ce7f9abbc474ccb57117ac26c86"; //GOOD THING I AM NOT PUBLICALLY HOSTING THIS ON GITHUB, OTHERWISE THIS WOULD BE PRETTY DUMB

const sets = [
  {id : 'LNS14000006', key: 'Black to White Unemployment Gap', name: "black"},
  {id : 'LNS14000003', key: 'White to Black Unemployment' , name: "white"},
  {id : 'LNS14000036', key: '20-24 to 25-54 Unemployment Gap', name: "20-24"},
  {id : 'LNS14000060', key: '25-54 to Unemployment', name: "25-54"},
  {id : 'LNS14027660', key: 'High school to Bachelors Unemployment Gap', name:"high school"},
  {id : 'LNS14027662', key: 'Bachelors to Highschool Degree Unemployment', name: "bachelors"},
]

/*const sets = [
  {id : 'LNS14000036', key: '20-24 Unemployment'},
  {id : 'LNS14000060', key: '25-54 Unemployment'},
]

/*const sets = [
  {id : 'LNS14027659', key: 'No Highschool Unemployment'},
  {id : 'LNS14027660', key: 'High School Unemployment'},
  {id : 'LNS14027662', key: 'Bachelors Degree Unemployment'},
  //{id : 'CGMD25O', key: 'Masters Degree Unemployment'},
]*/

/*const sets = [
  {id : 'LNU04000032', key: 'Black Women'},
  {id : 'LNS14000002', key: 'All Women'},
]*/

const fUnits = "";
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
    xTicks: {
      interval: timeMonth.every(1),
      format: timeFormat("%b - %y"),
    },
    yFormat: format(",.2f"),
    recessionsObj: recessions,
  }),
  mounted() {
    let promiseArray = [];
    sets.forEach((set) => {promiseArray.push(json(dataSeries(set.id)));})

    Promise.all([... promiseArray])
      .then((responses) => {
        let dataSet = [];

        for (let x=0; x < responses.length; x=x+2) {
            for (let y in responses[x].observations) {
                console.log("For", sets[x].key,"subtract: ",sets[x].name,"-",sets[x+1].name)
                dataSet.push({date: parseTime(responses[x].observations[y].date), value: +(responses[x].observations[y].value-responses[x+1].observations[y].value), key: sets[x].key})
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
