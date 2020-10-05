<template>
  <svg
      :width="svgWidth + margin.left + margin.right"
      :height="svgHeight / 8"
    >
      <g
        v-for="(path, index) in values"
        :key="path.key"
        :transform="`translate(${6 + 55 * index}, ${20})`"
        class="cell"
      >
        <circle :fill="path.color" r="6" />
        <text :fill="path.color" :transform="`translate(10,${svgHeight / 32})`">
          {{ path.key }}
        </text>
      </g>
    </svg>
</template>

<script>
import { scaleLinear } from "d3-scale";
//import { max, maxIndex, min, bisector } from "d3-array";
import { interpolatePath } from "d3-interpolate-path";

export default {
    name: "VueLine",
    props: {
        values: Array,
        index: Number,
        line: Function,
        t: Number,
        isDelayed: Boolean,
        
    },
    methods: {
        getSmoothInterpolation(indexSeries, line) {
            var interpolate =
                scaleLinear()
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

    },
    computed: {
        animatedPath() {
            let fakeValues = [];
            this.values.forEach((e, i) => {
                fakeValues.push({ time: e.time, value: -0.001 * i });
            });

            console.log("LINE VALUES", this.values, fakeValues);

            let fakeD = this.line(fakeValues);
            let d = this.line(this.values);

            console.log("line function: ", this.line)
            //console.log("pathInterpolation", this.getSmoothInterpolation(this.values, this.line)(0.5));

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
