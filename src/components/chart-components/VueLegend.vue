<template>
  <svg
      :width="svgWidth"
      :height="svgHeight"
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
        return [30+60*(index%maxCount),Math.ceil(index/maxCount)*30]
      },
    },
    mounted() {
      console.log("Vue Legend Mounted");
      console.log("Vue Legend Val", this.values)
    }
}
</script>

<style>
</style>
