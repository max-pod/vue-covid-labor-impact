<template>
  <!-- Line -->
  <path
    fill="none"
    :stroke="color"
    stroke-width="2"
    class="value-line"
    :d="animatedPath"
  />
</template>

<script>
import { scaleLinear } from "d3-scale";
//import { max, maxIndex, min, bisector } from "d3-array";
import { interpolatePath } from "d3-interpolate-path";
import { line } from "d3-shape";

export default {
    name: "VueLine",
    props: {
        values: Array,
        id: String,
        line: Function,
        color: String,
        t: Number,
        isDelayed: Boolean,
    },
    methods: {
        getSmoothInterpolation(indexSeries, line) {
            const interpolate =
                scaleLinear()
                .domain([0, 1])
                .range([1, indexSeries.length + 1]);

            return function(t) {
                const flooredX = Math.floor(interpolate(t));
                let interpolatedLine = indexSeries.slice(0, flooredX);

                if(flooredX > 0 && flooredX < indexSeries.length) {
                    const weight = interpolate(t) - flooredX;

                    const y = indexSeries[flooredX].value * weight + indexSeries[flooredX-1].value * (1-weight);
                    const x = indexSeries[flooredX].time * weight + indexSeries[flooredX-1].time * (1-weight);

                    interpolatedLine.push( {"time":x, "value": y} );
                }

                return line(interpolatedLine);
            }
        }
    },
    computed: {
        animatedPath() {
            return this.getSmoothInterpolation(this.values, this.line)(this.t)
        }
    },
}
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
