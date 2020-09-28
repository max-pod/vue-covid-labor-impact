<template>
  <div id="container" class="svg-container" align="left">
    <h1>{{ title }}</h1>
    <p v-if="mouseOver"><b>{{ yFormat(bisect.yVal) }}</b> in <span v-if="info.units">{{info.units.toLowerCase()}}</span> at {{ xFormat(bisect.xVal) }}, <span v-if="info.last_updated">last updated {{xFormat(info.last_updated)}}</span></p>
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

        <!-- Line -->
        <path
          fill="none"
          stroke="steelblue"
          stroke-width="2"
          class="value-line"
          d=""
        />

        <!-- Tooltip -->
        <g 
          v-if="mouseOver"
          class="focus">
          
          <line class="x-tool"
            stroke="black"
            stroke-dasharray="3px"
            opacity=.5
            y1=0
            :y2="svgHeight - bisect.y"
            :transform="`translate(${bisect.x}, ${bisect.y})`"
            />

          <line class="y-tool"
            stroke="black"
            stroke-dasharray="3px"
            opacity=.5
            :x2="svgWidth*2"
            :transform="`translate(${-svgWidth}, ${bisect.y})`"
          />

          <circle class="circle-tool"
            fill="white"
            stroke="black"
            r="4"
            :transform="`translate(${bisect.x}, ${bisect.y})`"
          />
          
        </g>
      </g>
    </svg>
    <p>
      <i>{{source}}</i>
    </p>
    <p v-if="info.notes"><i>{{info.notes}}</i></p>
  </div>
</template>

<script>
import * as d3 from "d3"; // TODO: OPTIMIZE THE FUCK OUT OF THIS
import { scaleLinear, scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";
import { max, min, bisector } from "d3-array";
import { selectAll, select } from "d3-selection";
import { transition } from "d3-transition";

export default {
  name: "LineChart",
  props: {
    title: String,
    source: String,
    xKey: String,
    yKey: String,
    xFormat: {
      type: Function,
      default: timeFormat("%b %d")
    },
    yFormat: {
      type: Function,
      default: d3.format(",.0f")
    },
    xSpecial: Array,
    ySpecial: Array,
    xTicks: {
      type: Object,
      default: () => ({
        interval: d3.timeMonth.every(2),
        format: d3.timeFormat("%b %e")
      })
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
      bottom: 80,
      top: 20,
    },
    redrawToggle: true,
    mouseOver: false,
    bisect: {
      x: null,
      y: null,
      xVal: null,
      yVal: null,
    },
  }),
  methods: {
    renderAxes() {
      //X-Axis
      d3.select(".x-axis")
        .call(
          d3
            .axisBottom(this.xScale)
            .tickValues([
              this.xScale.invert(0),
              ...this.xTicks.interval.range(this.xScale.domain()[0], this.xScale.domain()[1]),
            ])
            .tickFormat(this.xTicks.format)
        )
        .selectAll(".tick line")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0.1");

      //Y-Axis
      d3.select(".y-axis")
        .call(d3.axisLeft(this.yScale).ticks(5))
        .selectAll(".tick line")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0.1");

      // Change Text Color
      d3.selectAll(".y-axis text").attr("color", "#999");
      d3.selectAll(".x-axis text")
        .attr("color", "#999")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      // Change Path Color
      d3.selectAll(".y-axis path")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0");
      d3.selectAll(".x-axis path")
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
    renderLine(data) {
      const line = d3
        .line()
        .x((d) => {
          //console.log(d.date, d.value);
          return this.xScale(d[this.xKey]);
        })
        .y((d) => {
          return this.yScale(d[this.yKey]);
        });

      select(".value-line")
        .datum(data)
        .transition()
        // .delay((d, i) => {
        //   return i * 150;
        // })
        .duration(1000)
        .attr("d", (d) => {
          return line(d);
        });
    },
    AnimateLoad() {
      this.renderAxes();
      this.renderGrid();
      this.renderLine(this.data);

      //Special Dates
      let sDates = [
          { "Date": new Date("Jan 20, 2020"), text: "First U.S. Covid-19 Case" },
          { "Date": new Date("Mar 13, 2020"), text: "National Emergency Declared" },
          { "Date": new Date("March 13, 2020"), text: "CARES Act Enacted" },
          { "Date": new Date("March 13, 2020"), text: "Stimulus Payments Start" },
      ]
    },
    mousemove({ offsetX }) {
      if (this.data.length < 0) {
        return;
      }

      let x0 = this.xScale.invert(offsetX - this.margin.left),
        i = this.bisectX(this.data, x0, 1),
        d = this.data[i]

      if (!d) {
        console.log("couldn't find d with i:",i)
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

.focus line, .focus circle {
  transition: 0.5s;
}
</style>
