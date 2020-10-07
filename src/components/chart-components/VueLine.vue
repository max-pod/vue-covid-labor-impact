<template>
  <path
    @mouseover="mouseover"
    @mouseleave="mouseleave"
    fill="none"
    :stroke="color"
    :stroke-width="focused == index ? '5px' : '2px'"
    stroke-linecap="round"
    class="value-line"
    :d="animatedPath"
  />
</template>

<script>
import { scaleLinear } from "d3-scale";
import { interpolatePath } from "d3-interpolate-path";
import { line } from "d3-shape";

export default {
  name: "VueLine",
  props: {
    xKey: {
      type: String,
      default: "date",
    },
    yKey: {
      type: String,
      default: "value",
    },
    values: Array,
    id: String,
    index: Number,
    line: Function,
    color: {
      type: String,
      default: "Blue",
    },
    t: Number,
    isDelayed: Boolean,
    focused: Number,
  },
  data: () => ({
    mouseOver: false,
  }),
  methods: {
    getSmoothInterpolation(indexSeries, line, xKey, yKey) {
      const interpolate = scaleLinear()
        .domain([0, 1])
        .range([1, indexSeries.length + 1]);

      return function(t) {
        const flooredX = Math.floor(interpolate(t));
        let interpolatedLine = indexSeries.slice(0, flooredX);

        if (flooredX > 0 && flooredX < indexSeries.length) {
          const weight = interpolate(t) - flooredX;
          const x =
            indexSeries[flooredX][xKey] * weight +
            indexSeries[flooredX - 1][xKey] * (1 - weight);
          const y =
            indexSeries[flooredX][yKey] * weight +
            indexSeries[flooredX - 1][yKey] * (1 - weight);

          interpolatedLine.push({ [xKey]: x, [yKey]: y });
        }
        return line(interpolatedLine);
      };
    },
    mouseover() {
      this.mouseOver = true;
      this.$emit("focused", this.index);
    },
    mouseleave() {
      this.mouseOver = false;
      this.$emit("focused", -1);
    },
  },
  computed: {
    animatedPath() {
      return this.getSmoothInterpolation(
        this.values,
        this.line,
        this.xKey,
        this.yKey
      )(this.t);
    },
  },
  mounted() {
    console.log(this.values)
  }
};
</script>

<style>
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
