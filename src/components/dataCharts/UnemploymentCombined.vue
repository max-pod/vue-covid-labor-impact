<template>
  <div>
    <Chart title="Bar Chart" xKey="name" yKey="amount" :source="source" :data="barChartData" />
  </div>
</template>

<script>
import Chart from "../charts/StarterChart.vue";

export default {
  name: "UnemploymentCombined",
  data: () => ({
    source: {
        author: "Billy",
        year: "2020",
        title: "A look into XXX"
    },
    barChartData: [
      {
        name: "Roses",
        amount: 25
      },
      {
        name: "Tulips",
        amount: 40
      },
      {
        name: "Daisies",
        amount: 15
      },
      {
        name: "Narcissuses",
        amount: 9
      },
      
    ]
  }),
  components: {
    Chart,
  },
};
</script>