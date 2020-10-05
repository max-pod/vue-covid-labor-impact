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
    // mousemove({ offsetX }) {
    //   if (this.data.length < 0) {
    //     return;
    //   }

    //   let x0 = this.xScale.invert(offsetX - this.margin.left),
    //     i = this.bisectX(this.sumstat[0].values, x0, 1),
    //     d = this.sumstat[0].values[i];

    //   if (!d) {
    //     console.log("couldn't find d with i:", i);
    //     return;
    //   }

    //   this.bisect.x = this.xScale(d.date);
    //   this.bisect.xVal = d.date;

    //   this.sumstat.forEach((element, index) => {
    //     this.bisect.y[index] = this.yScale(element.values[i].value);
    //     this.bisect.yVal[index] = element.values[i].value;
    //   });

    //   this.bisect.yMin = min(values(this.bisect.y));
    // },
        bisectFunc() {
            return bisector((d) => d[this.xKey]).left
        },
   },
  computed: {
    offsetXX() {
        return this.offsetX+1;
    },
    iBisect() {
        let x0 = this.xScale.invert(this.offsetX - this.margin.left),
        i = this.bisectFunc()(this.sumstat[0].values, x0, 1)

        console.log("i", i)

        return i;
    },
    xValBisect() {
        console.log("BISECTING XVAL", this.sumstat[0].values[this.iBisect][this.xKey])
        return this.sumstat[0].values[this.iBisect][this.xKey]
    },
    xBisect() {
        return this.xScale(this.xValBisect)
    },
    yValBisect() {
        let yVal = [];
        
        this.sumstat.forEach((element, index) => {
            console.log("COMPUTUED ELEMENT", element.values[this.iBisect][this.yKey]);
            yVal.push(element.values[this.iBisect][this.yKey])
        });
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
