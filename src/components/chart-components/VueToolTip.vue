<template>
  <g class="focus">
    <line
      class="x-tool"
      stroke="black"
      stroke-dasharray="3px"
      opacity=".5"
      y1="0"
      :y2="svgHeight - yMinBisect"
      :transform="`translate(${xBisect}, ${yMinBisect})`"
    />

    <line
      class="y-tool"
      stroke="black"
      stroke-dasharray="3px"
      opacity=".5"
      :x2="svgWidth * 2"
      :transform="`translate(${-svgWidth}, ${yMinBisect})`"
    />

    <circle
      v-for="(value, index) in sumstat"
      :key="value.key"
      class="circle-tool"
      fill="white"
      stroke="black"
      r="4"
      :transform="`translate(${xBisect}, ${yBisect[index]})`"
    />
  </g>
</template>

<script>
import { max, min, bisector } from "d3-array";
import { values } from "d3-collection";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";

export default {
  name: "VueToolTip",
  props: {
    sumstat: Array,
    xKey: {
      type: String,
      default: "date",
    },
    yKey: {
      type: String,
      default: "value",
    },
    xScale: Function,
    yScale: Function,
    svgWidth: Number,
    svgHeight: Number,
    margin: Object,
    offsetX: Number,
  },
  methods: {
    bisectFunc() {
        return bisector((d) => d[this.xKey]).left
    },
    xFormat() {
        return timeFormat("%b %d");
    },
    yFormat() {
        return format(",.0f");
    },
   },
  computed: {
    iBisect() {
        let x0 = this.xScale.invert(this.offsetX - this.margin.left),
        i = this.bisectFunc()(this.sumstat[0].values, x0, 1)

        return i;
    },
    xValBisect() {
        return this.sumstat[0].values[this.iBisect][this.xKey]
    },
    xBisect() {
        return this.xScale(this.xValBisect)
    },
    yValBisect() {
        let yVal = [];
        
        this.sumstat.forEach((element, index) => {
            yVal.push(element.values[this.iBisect][this.yKey])
        });
        this.$emit("yVal", yVal);
        return yVal;
    },
    yBisect() {
        let y = []

        this.yValBisect.forEach((element) => {
            y.push(this.yScale(element))
        });
        return y;
    },
    yMinBisect() {
        return min(values(this.yBisect));
    },
  },
};
</script>

<style scoped></style>
