<template>
  <div id="container" class="svg-container" align="left">
    <h1>
      {{ title }}
      <small v-if="info.last_updated">({{ xFormat(info.last_updated) }})</small>
    </h1>
    <br/>
    
    <slot name="infoTop"/>
    
    <center>{{chartNote}}</center>
    <slot></slot>
    <center>{{xAxisNote}}</center>

    <slot name="legend"/>
    <slot name="infoBottom">
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
      title: {
        type: String,
        default: "Chart Title",
      },
      chartNote: {
        type: String,
        default: "Chart Description"
      },
      source: {
        type: String,
        default: "Chart Source"
      },
      xAxisNote: String,
      info: Object,
  },
  methods: {
    xFormat: timeFormat("%b %d"),
  }
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
