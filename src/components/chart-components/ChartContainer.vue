<template>
  <div id="container" class="svg-container" align="left">
    <h1>
      {{ title }}
      <small v-if="info.last_updated">(updated {{ xFormat(info.last_updated) }})</small>
    </h1>
    <br/>
    
    <slot name="info-top"/>
    
    <center>% job losses relative to prior employment peak</center>
    <slot></slot>
    <center>Number of Days to Full Recovery</center>

    <slot name="legend"/>
    <slot name="info-bottom">
        <p>
        <i>{{ source }}</i>
        </p>
        <p v-if="info.notes">
        <i>{{ info.notes }}</i>
        </p>
    </slot>
  </div>
</template>

<script>
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";

export default {
    name: "ChartContainer",
    props: {
        title: String,
        source: String,
        xKey: {
        type: String,
        default: "date",
        },
        yKey: {
        type: String,
        default: "value",
        },
        xFormat: {
        type: Function,
        default: format(",.0f"),
        },
        yFormat: {
        type: Function,
        default: format(",.0f"),
        },
        xSpecial: Array,
        ySpecial: Array,
        xTicks: {
        type: Object,
        default: () => ({
            format: format(",.0f"),
        }),
        },
        data: Array,
        info: Object,
  },
}
</script>

<style scoped>
h1 {
  font-family: "Garamond";
  font-weight: 800;
  font-size: 35px;
  text-align: center;
}

.svg-container {
  display: inline-block;
  position: relative;
  width: 100%;
  padding-bottom: 1%;
  vertical-align: top;
  overflow: hidden;
}
</style>
