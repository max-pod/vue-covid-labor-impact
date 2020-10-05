<template>
  <div id="container" class="svg-container" align="left">
    <h1>
      {{ title }}
      <small v-if="info.last_updated">
        (updated {{ xFormat(info.last_updated) }})</small
      >
    </h1>
    <p text-align="center">
    <center>% job losses relative to prior employment peak</center>
    </p>
    <svg
      v-if="redrawToggle === true"
      :width="svgWidth + margin.left + margin.right"
      :height="svgHeight + margin.top + margin.bottom"
    >
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
          v-for="(sum, index) in sumstat"
          :key="sum.key"
          :values="sum.values"
          :line="line"
          :color="color(index)"
          :id="sum.key"
          :t="t"
        />

      </g>
    </svg>
    <center>Days to Full Recovery</center>
    <!--<svg
      v-if="redrawToggle === true"
      :width="svgWidth + margin.left + margin.right"
      :height="svgHeight / 8"
    >
      <g
        v-for="(path, index) in animatedPath"
        :key="path.key"
        :transform="`translate(${6 + 55 * index}, ${20})`"
        class="cell"
      >
        <circle :fill="path.color" r="6" />
        <text :fill="path.color" :transform="`translate(10,${svgHeight / 32})`">
          {{ path.key }}
        </text>
      </g>
    </svg>-->
    <p>
      <i>{{ source }}</i>
    </p>
    <p v-if="info.notes">
      <i>{{ info.notes }}</i>
    </p>
  </div>
</template>

<script>
import * as d3 from "d3"; // TODO: OPTIMIZE THE FUCK OUT OF THIS
import { scaleLinear, scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";
import { max, maxIndex, min, bisector } from "d3-array";
import { selectAll, select } from "d3-selection";
import { axisLeft, axisBottom } from "d3-axis";
import { transition } from "d3-transition";
import { nest, values } from "d3-collection";
import { schemeCategory10, schemePaired, schemeSet1 } from "d3-scale-chromatic";

import { interpolatePath } from "d3-interpolate-path";
import * as tweenObj from "@tweenjs/tween.js";
const TWEEN = tweenObj.default;

import gsap from "gsap";

import VueLine from "../chart-components/VueLine";

export default {
  name: "AnimatedLineChart",
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
      left: 100,
      right: 10,
      bottom: 45,
      top: 10,
    },
    redrawToggle: true,
    mouseOver: false,
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
    delayedT: 0,
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
      const yGrid = d3
        .axisLeft(this.yScale)
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
    getSmoothInterpolation(indexSeries, line) {
      var interpolate = d3
        .scaleLinear()
        .domain([0, 1])
        .range([1, indexSeries.length + 1]);

      return function(t) {
        var flooredX = Math.floor(interpolate(t));
        var interpolatedLine = indexSeries.slice(0, flooredX);

        if (flooredX > 0 && flooredX < indexSeries.length) {
          var weight = interpolate(t) - flooredX;
          var weightedLineAverage =
            indexSeries[flooredX].y * weight +
            indexSeries[flooredX - 1].y * (1 - weight);
          interpolatedLine.push({
            x: interpolate(t) - 1,
            y: weightedLineAverage,
          });
        }

        return line(interpolatedLine);
      };
    },
    renderLine(data) {
      //console.log(this.sumstat);

      this.paths = [];
      this.sumstat.forEach((element, index) => {
        let fakeValues = [];
        element.values.forEach((e, i) => {
          fakeValues.push({ time: e.time, value: -0.001 * i });
        });

        console.log(element.values, fakeValues);

        let fakeD = this.line(fakeValues);
        let d = this.line(element.values);

        if (this.sumstat.length - 1 == index) {
          console.log("animating final graph");
          setTimeout(() => {
            this.paths.push({
              key: element.key,
              d: this.getSmoothInterpolation(element.values, this.line)(0.5),
              color: this.color(element.key),
              pathLength: this.svgWidth * 1.2,
            });
          }, 0);
        } else {
          console.log(
            "pathInterpolation",
            this.getSmoothInterpolation(element.values, this.line)(0.5)
          );

          this.paths.push({
            key: element.key,
            d: this.getSmoothInterpolation(element.values, this.line)(0.6),
            color: this.color(element.key),
            pathLength: this.svgWidth * 1.2,
          });
        }
      });
    },
    AnimateLoad() {
      this.renderAxes();
      this.renderGrid();
      //this.renderLine(this.data);

      console.log("A sumstat", this.sumstat)

      //setTimeout(() => {
      this.tween(0, 1);
      //}, 1000);
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

      //console.log("end val", end)
      const time = {timeVal: start}; // Start at (0, 0)
      const tween = new TWEEN.Tween(time) // Create a new tween that modifies 'coords'.
        .to({timeVal: end}, 5000) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
          // Called after tween.js updates 'coords'.
          // Move 'box' to the position described by 'coords' with a CSS translation.
          //console.log("TIME IS EQUAL TO", time.timeVal)
          this.t = time.timeVal;
        })
        .start(); // Start the tween immediately.

      const tween2 = new TWEEN.Tween(time) // Create a new tween that modifies 'coords'.
        .to({timeVal: end}, 10000) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
          // Called after tween.js updates 'coords'.
          // Move 'box' to the position described by 'coords' with a CSS translation.
          //console.log("TIME IS EQUAL TO", time.timeVal)
          this.delayedT = time.timeVal;
        })
        .delay(6000)
        .start();
        
    },
  },
  components: {
    VueLine,
  },
  computed: {
    recoveryBisector() {
      return bisector((d) => {
        return d.rawDate;
      }).left;
    },
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
          d3.extent(this.data, (d) => {
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
      return d3
        .line()
        .x((d) => {
          return this.xScale(d[this.xKey]);
        })
        .y((d) => {
          return this.yScale(d[this.yKey]);
        });
    },
    color() {
      let res = this.data.map((d) => {
        return d.key;
      });
      return d3.scaleOrdinal(schemeSet1).domain(res);
    },
    bisectX() {
      return bisector((d) => d[this.xKey]).left;
    },
    svgHeight() {
      return this.svgWidth / 1.61803398875; // golden ratio
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
