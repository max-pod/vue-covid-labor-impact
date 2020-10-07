<template>
  <div id="vis">
    <component v-bind:is="stepSource" />
  </div>
</template>

<script>
import UniqueImpact from "./dataCharts/UniqueImpact";

import UnemploymentCombined from "./dataCharts/UnemploymentCombined.vue";
import MonetaryPolicy from "./dataCharts/MonetaryPolicy.vue";
import FiscalPolicy from "./dataCharts/FiscalPolicy.vue";


export default {
    name: 'vis',
    props: ['stepIndex','stepSource'],
    components: {
        UniqueImpact,
        UnemploymentCombined,
        MonetaryPolicy,
        FiscalPolicy,
    }
}
</script>

<style scoped>
#vis {
  display: inline-block;
  position: fixed;
  top: 100px;
  height: 100%;
  right: 0%;
  z-index: 1;
  margin-left: 0;
}

text {
  font-family: "Garamond";
}

#tooltip {
  position: absolute;
  display: none;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 3px;
  box-shadow: -3px 3px 15px #939393;
  color: white;
  padding: 6px;
  font-family: "Merriweather";
  font-size: 1.1em;
  max-width: 400px;
  z-index: 100;
}

svg circle:hover {
  cursor: pointer;
}

.swatch {
  fill: #939393;
}

.sizeLegend2 {
  opacity: 0.7;
}

img {
  display: none;
}
</style>
