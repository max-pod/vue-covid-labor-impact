<template>
  <svg
      :width="svgWidth"
      :height="maxHeight(values.length)"
    >
      <g
        v-for="(value, index) in values"
        :key="value.key"
        :transform="`translate(${position(index+1, values.length)})`"
        :class="{hover: (index == focused)}"
      >
        <circle :fill="color(index)" r="6" />
        <text :fill="color(index)" :transform="`translate(10,10)`">
          {{ value.key }}
        </text>
      </g>
    </svg>
</template>

<script>
export default {
    name: "VueLegend",
    props: {
      values: Array,
      focused: {
        type: Number,
        default: 100,
      },
      maxCount: {
        type: Number,
        default: 6
      },
      color: Function,
      svgHeight: Number,
      svgWidth: Number,
    },
    methods: {
      position(index, length) {
        let x = (index%this.maxCount != 0) ? index%this.maxCount-1 : this.maxCount-1
        console.log("legend x",x)
        return [30+this.svgWidth/this.maxCount*(x),Math.ceil(index/this.maxCount)*25]
      },
      maxHeight(length) {
        return Math.ceil(length/this.maxCount)*25+10+5
      }
    },
    mounted() {
      //console.log("Vue Legend Mounted");
      //console.log("Vue Legend Val", this.values)
    }
}
</script>

<style>
.hover {
  font-weight: bold;
}
</style>
