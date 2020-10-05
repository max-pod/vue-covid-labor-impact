<template>
  <ChartContainer
    :info="info"
    :title="title">
    <template #infoTop>
      <transition name="fade">
        <p v-if="mouseOver">
          <span v-for="(element, index) in sumstat" :key="element.key">
          {{element.key}}:<b> {{ yFormat(yVal[index]) }}</b>
          </span>
        </p>
      </transition>
    </template>

    <template #default>
      <svg
        @mousemove="offsetX = $event.offsetX"
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

          <VueToolTip
            @yVal="yVal = $event"
            v-if="mouseOver"
            :sumstat="sumstat"
            :xKey="xKey"
            :yKey="yKey"
            :xScale="xScale"
            :yScale="yScale"
            :svgWidth="svgWidth"
            :svgHeight="svgHeight"
            :margin="margin"
            :offsetX="offsetX"
          />
        </g>
      </svg>
    </template>

    <template #legend>
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
import * as d3 from "d3"; // TODO: OPTIMIZE THE FUCK OUT OF THIS
import { scaleLinear, scaleTime, scaleOrdinal } from "d3-scale";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";
import { max, min, bisector } from "d3-array";
import { selectAll, select } from "d3-selection";
import { axisLeft, axisBottom } from "d3-axis";
import { transition } from "d3-transition";
import { nest, values } from "d3-collection";
import { schemeSet1, interpolateTurbo } from "d3-scale-chromatic";
import { line } from "d3-shape";

import ChartContainer from "../chart-components/ChartContainer"
import VueToolTip from "../chart-components/VueToolTip"
import VueLegend from "../chart-components/VueLegend"
import VueLine from "../chart-components/VueLine"

import * as tweenObj from "@tweenjs/tween.js";
const TWEEN = tweenObj.default;

export default {
  name: "MultiLineChart",
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
      default: timeFormat("%b %d"),
    },
    yFormat: {
      type: Function,
      default: d3.format(",.0f"),
    },
    xSpecial: Array,
    ySpecial: Array,
    xTicks: {
      type: Object,
      default: () => ({
        interval: d3.timeMonth.every(4),
        format: d3.timeFormat("%b - %y"),
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
      left: 30,
      right: 10,
      bottom: 60,
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
    paths: [],
    offsetX: null,
    yVal: [0],
    focused: -1,
    t: 0,
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
    AnimateLoad() {
      this.renderAxes();
      this.renderGrid();

      this.tween(0, 1);
    },
    mousemove({ offsetX }) {
      if (this.data.length < 0) {
        return;
      }

      let x0 = this.xScale.invert(offsetX - this.margin.left),
        i = this.bisectX(this.sumstat[0].values, x0, 1),
        d = this.sumstat[0].values[i];

      if (!d) {
        console.log("couldn't find d with i:", i);
        return;
      }

      this.bisect.x = this.xScale(d.date);
      this.bisect.xVal = d.date;

      this.sumstat.forEach((element,index) => {
        this.bisect.y[index] = this.yScale(element.values[i].value)
        this.bisect.yVal[index] = element.values[i].value
      })

      this.bisect.yMin = min(values(this.bisect.y))
      
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
    sumstat() {
      return nest()
        .key((d) => { return d.key})
        .entries(this.data)
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
      return scaleTime()
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
      return line()
        .x((d) => { return this.xScale(d[this.xKey]); })
        .y((d) => { return this.yScale(d[this.yKey]); });
    },
    bisectX() {
      return bisector((d) => d[this.xKey]).left;
    },
    svgHeight() {
      return this.svgWidth / 1.61803398875; // golden ratio
    },
    color() {
      return scaleOrdinal(schemeSet1).domain([0,this.sumstat.length-1]);
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
  components: {
    VueLine,
    VueLegend,
    ChartContainer,
    VueToolTip,
  },
};
</script>
}
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
