<template>
    <div id="vis">
        {{stepIndex}}
        {{stepSource}}
        <component v-bind:is="stepSource"/>
    </div>
</template>

<script>
import UnemploymentCombined from "./dataCharts/UnemploymentCombined.vue";
import MonetaryPolicy from "./dataCharts/MonetaryPolicy.vue";
import FiscalPolicy from "./dataCharts/FiscalPolicy.vue";

export default {
    name: 'vis',
    props: ['stepIndex','stepSource'],
    components: {
        UnemploymentCombined: UnemploymentCombined,
        MonetaryPolicy: MonetaryPolicy,
        FiscalPolicy: FiscalPolicy,
    }
}
</script>

<style scoped>
#vis {
    display: inline-block;
    position: fixed;
    top: 100px;
    z-index: 1;
    margin-left: 0;
    height: 1000px;
    width: 1000px;
}

#vis .h1 {
    font-family: "Garamond";
    font-weight:800;
    font-size: 20px;
}

text {
    font-family: "Garamond"
}

.y1, .y2 {
    color: orange;
}

.y1, .y2, .y3, .y4 {
    font-weight:600;
}

.tick line {
    stroke: 'red'
}

#tooltip {
    position: absolute;
    display: none;
    background: rgba(0, 0, 0, .7);
    border-radius: 3px;
    box-shadow: -3px 3px 15px #939393;
    color: white;
    padding: 6px;
    font-family: "Merriweather";
    font-size: 1.1em;
    max-width: 400px;
    z-index: 100;
}

svg circle:hover{
    cursor: pointer;
}

.swatch {
    fill: #939393;
}

.sizeLegend2 {
    opacity: 0.7
}

img {
    display: none;
}
</style>