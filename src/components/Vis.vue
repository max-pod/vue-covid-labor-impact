<template>
  <div id="vis">
    <component v-bind:is="stepSource" />
  </div>
</template>

<script>
import UniqueImpact from "./dataCharts/UniqueImpact";
import MonetaryPolicy from "./dataCharts/MonetaryPolicy";
import FiscalPolicy from "./dataCharts/FiscalPolicy";
import EmploymentByWage from "./dataCharts/EmploymentByWage";
import EmploymentByIndustry from "./dataCharts/EmploymentByIndustry"
import JobPostingByEducation from "./dataCharts/JobPostingByEducation"
import MathByIncome from "./dataCharts/MathByIncome"
import SpendingByIncome from "./dataCharts/SpendingByIncome"
import PandemicNumbers from "./dataCharts/PandemicNumbers"
import SpendingByIndustry from "./dataCharts/SpendingByIndustry"

import HoursImpact from "./dataCharts/HoursImpact"
import TestLine from "./dataCharts/TestLine"
import TestMulti from "./dataCharts/TestMulti"

export default {
    name: 'vis',
    props: ['stepIndex','stepSource'],
    components: {
        UniqueImpact,

        MonetaryPolicy,
        FiscalPolicy,

        EmploymentByWage,
        EmploymentByIndustry,
        JobPostingByEducation,
        MathByIncome,
        SpendingByIncome,
        PandemicNumbers,
        SpendingByIndustry,

        HoursImpact,
        TestLine,
        TestMulti,
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
