<template>
  <svg
      :width="svgWidth"
      :height="maxHeight(values.length)"
    >
      <g
        v-for="(value, index) in values"
        :key="value.key"
        :transform="`translate(${position(index+1, values.length)})`"
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
      focused: Boolean,
      color: Function,
      svgHeight: Number,
      svgWidth: Number,
    },
    methods: {
      position(index, length) {
        const maxCount = 6;
        console.log("x", index%maxCount)
        let x = (index%maxCount != 0) ? index%maxCount-1 : 5
        return [30+60*(x),Math.ceil(index/maxCount)*25]
      },
      maxHeight(length) {
        return Math.ceil(length/6)*25+10+5
      }
    },
    mounted() {
      console.log("Vue Legend Mounted");
      console.log("Vue Legend Val", this.values)
    }
}
</script>

<style>
</style>
