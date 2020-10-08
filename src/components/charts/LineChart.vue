<template>
  <ChartContainer
    :title="title"
    :info="info"
    :chartNote="chartNote"
    :xAxisNote="xAxisNote"
    :source="source"
  >
    <template #infoTop>
    <transition name="fade">
      <p v-if="mouseOver">
        <b>{{ yFormat(bisect.yVal) }} </b>
        <span v-if="info.units">{{ info.units.toLowerCase() }}</span> on {{ xFormat(bisect.xVal) }}
      </p>
    </transition>
    </template>

    <template #default>
      <svg
        @mousemove="mousemove"
        @mouseover="mouseover"
        @mouseleave="mouseleave"
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

          <VueSpecialRect
            v-for="(element, index) in xSpecial"
            :key="element.key"
            :xValue="element"
            :xKey="xKey"
            :xScale="xScale"
            :rectHeight="svgHeight"
            :index="index"
          />

          <VueLine
            @focused="focused = $event"
            :xKey="xKey"
            :yKey="yKey"
            :values="data"
            :line="line"
            :color="color()(0)"
            :index="0"
            id="FIND SOMETHIGN HERE"
            :t="t"
          />

          <!-- Tooltip -->
          <g v-if="mouseOver" class="focus">
            <line
              class="x-tool"
              stroke="black"
              stroke-dasharray="3px"
              opacity=".5"
              y1="0"
              :y2="svgHeight - bisect.y"
              :transform="`translate(${bisect.x}, ${bisect.y})`"
            />

            <line
              class="y-tool"
              stroke="black"
              stroke-dasharray="3px"
              opacity=".5"
              :x2="svgWidth * 2"
              :transform="`translate(${-svgWidth}, ${bisect.y})`"
            />

            <circle
              class="circle-tool"
              fill="white"
              stroke="black"
              r="4"
              :transform="`translate(${bisect.x}, ${bisect.y})`"
            />
          </g>
        </g>
      </svg>
    </template>
  </ChartContainer>
</template>

<script>
//import * as d3 from "d3"; // TODO: OPTIMIZE THE FUCK OUT OF THIS
import { scaleLinear, scaleTime, scaleOrdinal } from "d3-scale";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";
import { max, min, bisector, extent } from "d3-array";
import { selectAll, select } from "d3-selection";
import { axisLeft, axisBottom } from "d3-axis";
import { transition } from "d3-transition";
import { line } from "d3-shape";
import { schemeSet1 } from "d3-scale-chromatic";
import { timeMonth } from "d3-time";

import ChartContainer from "../chart-components/ChartContainer"
import VueLine from "../chart-components/VueLine"
import VueSpecialRect from "../chart-components/VueSpecialRect"

import * as tweenObj from "@tweenjs/tween.js";
const TWEEN = tweenObj.default;

export default {
  name: "LineChart",
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
      default: timeFormat("%b %d"),
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
        interval: timeMonth.every(2),
        format: timeFormat("%b %e"),
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
      bottom: 60,
      top: 10,
    },
    redrawToggle: true,
    mouseOver: false,
    bisect: {
      x: null,
      y: null,
      xVal: null,
      yVal: null,
    },
    t: 1,
  }),
  methods: {
    renderAxes() {
      //X-Axis
      select(".x-axis")
        .call(
          axisBottom(this.xScale)
            .tickValues([
              this.xScale.invert(0),
              ...this.xTicks.interval.range(
                this.xScale.domain()[0],
                this.xScale.domain()[1]
              ),
            ])
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
      //this.renderLine(this.data);
      this.tween(0, 1);
    },
    mousemove({ offsetX }) {
      if (this.data.length < 0) {
        return;
      }

      let x0 = this.xScale.invert(offsetX - this.margin.left),
        i = this.bisectX(this.data, x0, 1),
        d = this.data[i];

      if (!d) {
        console.log("couldn't find d with i:", i);
        return;
      }

      this.bisect.x = this.xScale(d.date);
      this.bisect.y = this.yScale(d.value);
      this.bisect.xVal = d.date;
      this.bisect.yVal = d.value;
    },
    mouseover() {
      this.mouseOver = true;
    },
    mouseleave() {
      this.mouseOver = false;
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
    color() {
      return scaleOrdinal(schemeSet1).domain([0,1]);
    },
    tween(start, end) {
      let frameHandler;

      const animate = function(currentTime) {
        TWEEN.update(currentTime);
        frameHandler = requestAnimationFrame(animate);
      };
      frameHandler = requestAnimationFrame(animate);

      const time = {timeVal: start}; // Start at (0, 0)
      const tween = new TWEEN.Tween(time) // Create a new tween that modifies 'coords'.
        .to({timeVal: end}, 3000) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
          this.t = time.timeVal;
        })
        .start(); // Start the tween immediately.
    },
  },
  computed: {
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
      return scaleTime()
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
    bisectX() {
      return bisector((d) => d[this.xKey]).left;
    },
    svgHeight() {
      return this.svgWidth / 1.61803398875; // golden ratio
    },
    line() {
      return line()
        .x((d) => { return this.xScale(d[this.xKey]); })
        .y((d) => { return this.yScale(d[this.yKey]); });
    },
  },
  watch: {
    data: function(oldData, newData) {
      this.data.redrawToggle = false;
      setTimeout(() => {
        this.data.redrawToggle = true;
        this.AnimateLoad();
      }, 500);
    },
  },
  components: {
    ChartContainer,
    VueLine,
    VueSpecialRect,
  }
};
</script>

<style scoped>
.bar-positive {
  fill: steelblue;
  transition: r 0.2s ease-in-out;
}

.bar-positive:hover {
  fill: brown;
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
