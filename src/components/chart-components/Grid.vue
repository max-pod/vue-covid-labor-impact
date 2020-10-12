<template>
  <!-- Grids -->
  <g>
    <g class="gf-x-grid grid" :transform="`translate(0, ${svgHeight})`" />
    <g class="gf-y-grid grid" />
  </g>
</template>

<script>
import { selectAll, select } from "d3-selection";
import { axisLeft } from "d3-axis";

export default {
  name: "VueGrids",
  props: {
    yScale: Function,
    svgWidth: {
      type: Number,
      default: 500,
    },
    svgHeight: Number,
    ySpecial: Array,
  },
  methods: {
    renderGrid() {
      const yGrid = axisLeft(this.yScale)
        .ticks(5)
        .tickSize(-this.svgWidth)
        .tickFormat("");
      
      let gridSelect = select(".gf-y-grid")
        .call(yGrid)
        .selectAll("line")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0.1")
        .attr("stroke-width", "1px");
      // Hide border paths

      selectAll(".gf-y-grid text")
        .attr("color", "#999")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      select(".gf-y-grid path").attr("stroke-opacity", "0");
      select(".gf-x-grid path").attr("stroke-opacity", "0");

      if (this.ySpecial) {
        let gTicks = selectAll("g.tick").filter((d) => {
          console.log("filtering with ",this.ySpecial.includes(d));
          return this.ySpecial.includes(d);
        }).select('line')
          .attr("stroke-width", "2px")
          .attr("stroke-opacity", "1")
          .attr("stroke", '#FF0000')
      }
    },
  },
  mounted() {
    this.renderGrid();
  },
  watch: {
    yScale: function (oldYScale, newYScale) {
      this.renderGrid();
    }
  }
};
</script>
