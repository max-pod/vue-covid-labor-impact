<template>
    <div>
        <h1>Unemployment Combined</h1>
        <UnemploymentAreaChart>weee</UnemploymentAreaChart>
    </div>
</template>

<script>
import AreaChart from "../charts/AreaChart.vue";

export default {
    name: 'UnemploymentCombined',
    components: {
        UnemploymentAreaChart: AreaChart
    }
}