<template>
  <rect
    fill="grey"
    fill-opacity="0.5"
    class="special-rect"
    :width="rectWidth"
    :height="rectHeight"
    :transform="`translate(${rectX},0)`"
  />
</template>

<script>
export default {
    name: "VueSpecialRect",
    props: {
        xKey: {
            type: String,
            default: "date",
        },
        xScale: Function,
        xValue: Object,
        rectHeight: Number,
    },
    computed: {
        rectX() {
            //console.log(this.xScale(this.xValue.peak))
            return this.xScale(this.xValue.peakDate)
        },
        rectWidth() {
            let trough = (this.xValue.troughDate == "" || !this.xValue.troughDate) ? new Date() : this.xValue.troughDate;
            //console.log("RECT WIDTH", this.xScale(trough))
            return this.xScale(trough) - this.rectX;
        }
    },
}
</script>
