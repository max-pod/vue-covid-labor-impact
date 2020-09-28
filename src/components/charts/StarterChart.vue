<template>
  <div id="container" class="svg-container" align="left">
    <h1>{{ title }}</h1>
    <svg
      v-if="redrawToggle === true"
      :width="svgWidth + margin.left + margin.right"
      :height="svgHeight + margin.top + margin.bottom"
    >
      <g :transform="`translate(${margin.left+3}, ${10})`">
        <!-- Axis -->
        <g class="x-axis" :transform="`translate(0, ${svgHeight})`" />
        <g class="y-axis" />

        <!-- Grids -->
        <g>
          <g class="gf-x-grid grid" :transform="`translate(0, ${svgHeight})`" />
          <g class="gf-y-grid grid" />
        </g>

        <!-- Bars -->
        <rect
          v-for="item in data"
          class="bar-positive"
          :key="item[xKey]"
          :x="xScale(item[xKey])"
          :y="yScale(0)"
          :width="xScale.bandwidth()"
          :height="0"
        />

        <!-- Tooltip -->
        <!-- <rect :width="width" :height="height" class="overlay"></rect>
      <g class="focus">
        <rect
          width="100"
          height="30"
          class="tooltip"
          y="0"
          rx="4"
          ry="4"
        ></rect>
        </g>-->
      </g>
    </svg>
    <p><i>{{`See ${source.title} (${source.author}, ${source.year})`}}</i></p>
  </div>
</template>

<script>
import * as d3 from "d3"; // TODO: OPTIMIZE THE FUCK OUT OF THIS
import { scaleLinear, scaleBand } from "d3-scale";
import { max, min } from "d3-array";
import { selectAll } from "d3-selection";
import { transition } from "d3-transition";

export default {
  name: "Chart",
  props: {
    title: String,
    source: Object,
    xKey: String,
    yKey: String,
    data: Array,
  },
  mounted() {
    this.svgWidth = document.getElementById("container").offsetWidth * 0.75;
    this.AddResizeListener();
    this.AnimateLoad();
  },
  data: () => ({
    svgWidth: 0,
    margin: {
      left: 40,
      right: 10,
      bottom: 80,
      top: 20
    },
    redrawToggle: true,
  }),
  methods: {
    renderAxes() {
      //X-Axis
      d3.select(".x-axis")
      .call(d3.axisBottom(this.xScale).ticks(7))
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
      d3.selectAll(".x-axis text").attr("color", "#999")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" );
      
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
      d3.select(".gf-y-grid")
        .call(yGrid)
        .selectAll("line")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0.1")
        .attr("stroke-width", "1px");
      // Hide border paths
      d3.select(".gf-y-grid path").attr("stroke-opacity", "0");
      d3.select(".gf-x-grid path").attr("stroke-opacity", "0");
    },
    AnimateLoad() {
      this.renderAxes();
      this.renderGrid();

      selectAll("rect")
        .data(this.data)
        .transition()
        .delay((d, i) => {
          return i * 150;
        })
        .duration(1000)
        .attr("y", (d) => {
          return this.yScale(d[this.yKey]);
        })
        .attr("height", (d) => {
          return this.svgHeight - this.yScale(d[this.yKey]);
        });
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
      return scaleBand()
        .rangeRound([0, this.svgWidth])
        .padding(0.1)
        .domain(
          this.data.map((d) => {
            return d[this.xKey];
          })
        );
    },
    yScale() {
      return scaleLinear()
        .rangeRound([this.svgHeight, 0])
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax]);
    },
    svgHeight() {
      return this.svgWidth / 1.61803398875; // golden ratio
    },
  },
};
</script>

<style scoped>
h1 {
    font-family: "Garamond";
    font-weight:800;
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
</style>
