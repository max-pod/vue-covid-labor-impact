<template>
  <ChartContainer
    :title="title"
    :info="info"
    :chartNote="chartNote"
    :xAxisNote="xAxisNote"
    :source="source"
  >
    <template v-slot:default>
      <svg
        v-if="redrawToggle === true"
        :width="svgWidth + margin.left + margin.right"
        :height="svgHeight + margin.top + margin.bottom">
        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <!-- Axis -->
          <g class="x-axis" :transform="`translate(0, ${svgHeight})`" />
          <g class="y-axis" />

          <!-- Grids -->
          <g>
            <g class="gf-x-grid grid" :transform="`translate(0, ${svgHeight})`" />
            <g class="gf-y-grid grid" />
          </g>

          <VueLine
            @focused="focused = $event"
            v-for="(sum, index) in sumstat"
            :key="sum.key"
            :xKey="xKey"
            :yKey="yKey"
            :values="sum.values"
            :line="line"
            :color="color(index)"
            :id="sum.key"
            :index="index"
            :t="t"
          />
        </g>
      </svg>
    </template>

    <template v-slot:legend>
      <VueLegend
        :values="sumstat"
        :focused="focused"
        :color="color"
        :svgHeight="svgHeight/2"
        :svgWidth="svgWidth"
      />
    </template>

  </ChartContainer>
</template>

<script>
//import * as d3 from "d3"; // TODO: OPTIMIZE THE FUCK OUT OF THIS
import { scaleLinear, scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";
import { max, maxIndex, min, bisector, extent } from "d3-array";
import { selectAll, select } from "d3-selection";
import { axisLeft, axisBottom } from "d3-axis";
import { nest, values } from "d3-collection";
import { schemeSet1, interpolateTurbo } from "d3-scale-chromatic";
import { line } from "d3-shape";

import * as tweenObj from "@tweenjs/tween.js";
const TWEEN = tweenObj.default;

import VueLine from "../chart-components/VueLine";
import VueLegend from "../chart-components/VueLegend";
import ChartContainer from "../chart-components/ChartContainer"

export default {
  name: "AnimatedLineChart",
  props: {
    title: String,
    source: String,
    chartNote: String,
    xAxisNote: String,
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
  mounted() {
    this.svgWidth = document.getElementById("container").offsetWidth * 0.75;
    this.AddResizeListener();
    if (this.data.length >= 0) {
      this.AnimateLoad();
    }
  },
  data: () => ({
    svgWidth: 0,
    margin: {
      left: 40,
      right: 10,
      bottom: 45,
      top: 10,
    },
    redrawToggle: true,
    bisect: {
      x: "",
      xVal: "",
      yVal: {},
      y: {},
      yMin: null,
    },
    animatedData: [],
    paths: [],
    t: 0,
    focused: -1,
  }),
  methods: {
    renderAxes() {
      //X-Axis
      select(".x-axis")
        .call(
          axisBottom(this.xScale)
            .ticks(10)
            .tickFormat(this.xTicks.format)
        )
        .selectAll(".tick line")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0.1");

      //Y-Axis
      select(".y-axis")
        .call(axisLeft(this.yScale).ticks(5))
        .selectAll(".tick line")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0.1");

      // Change Text Color
      selectAll(".y-axis text").attr("color", "#999");
      selectAll(".x-axis text")
        .attr("color", "#999")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      // Change Path Color
      selectAll(".y-axis path")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0");
      selectAll(".x-axis path")
        .attr("stroke", "#999")
        .attr("stroke-opacity", "0.1");
    },
    renderGrid() {
      const yGrid = axisLeft(this.yScale)
        .ticks(5)
        .tickSize(-this.svgWidth)
        .tickFormat("");
      select(".gf-y-grid")
        .call(yGrid)
        .selectAll("line")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0.1")
        .attr("stroke-width", "1px");
      // Hide border paths
      select(".gf-y-grid path").attr("stroke-opacity", "0");
      select(".gf-x-grid path").attr("stroke-opacity", "0");
    },
    AnimateLoad() {
      this.renderAxes();
      this.renderGrid();

      this.tween(0, 1);
    },
    AddResizeListener() {
      // redraw the chart 300ms after the window has been resized
      window.addEventListener("resize", () => {
        this.$data.redrawToggle = false;
        setTimeout(() => {
          this.$data.redrawToggle = true;
          this.$data.svgWidth =
            document.getElementById("container").offsetWidth * 0.75;
          this.AnimateLoad();
        }, 300);
      });
    },
    tween(start, end) {
      let frameHandler;

      // Handles updating the tween on each frame.
      const animate = function(currentTime) {
        TWEEN.update(currentTime);
        frameHandler = requestAnimationFrame(animate);
      };
      frameHandler = requestAnimationFrame(animate);

      const time = {timeVal: start}; // Start at (0, 0)
      const tween = new TWEEN.Tween(time) // Create a new tween that modifies 'coords'.
        .to({timeVal: end}, 5000) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
          this.t = time.timeVal;
        })
        .start(); // Start the tween immediately.
    },
  },
  components: {
    VueLine,
    VueLegend,
    ChartContainer,
  },
  computed: {
    sumstat() {
      return nest()
        .key((d) => {
          return d.key;
        })
        .entries(this.data);
    },
    dataMax() {
      return max(this.data, (d) => {
        return d[this.yKey];
      });
    },
    dataMin() {
      return min(this.data, (d) => {
        return d[this.yKey];
      });
    },
    xScale() {
      return scaleLinear()
        .rangeRound([0, this.svgWidth])
        .domain(
          extent(this.data, (d) => {
            return d[this.xKey];
          })
        );
    },
    yScale() {
      return scaleLinear()
        .rangeRound([this.svgHeight, 0])
        .domain([this.dataMin > 0 ? 0 : this.dataMin, (this.dataMax * 6) / 5])
        .nice();
    },
    line() {
      return line()
        .x((d) => {
          return this.xScale(d[this.xKey]);
        })
        .y((d) => {
          return this.yScale(d[this.yKey]);
        });
    },
    color() {
      return (i) => { return interpolateTurbo((i+1)/(this.sumstat.length+1))};
    },
    svgHeight() {
      return this.svgWidth * .6; // golden ratio
    },
  },
  watch: {
    data: function(oldData, newData) {
      this.data.redrawToggle = false;
      setTimeout(() => {
        this.data.redrawToggle = true;
        this.AnimateLoad();
      }, 300);
    },
  },
};
</script>

<style scoped>
h1 {
  font-family: "Garamond";
  font-weight: 800;
  font-size: 35px;
  text-align: center;
}

.bar-positive {
  fill: steelblue;
  transition: r 0.2s ease-in-out;
}

.bar-positive:hover {
  fill: brown;
}

.svg-container {
  display: inline-block;
  position: relative;
  width: 100%;
  padding-bottom: 1%;
  vertical-align: top;
  overflow: hidden;
}

.overlay {
  fill: none;
  pointer-events: all;
}

.tooltip {
  fill: white;
  stroke: #444;
}

line,
.focus circle {
  transition: 0.5s;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
