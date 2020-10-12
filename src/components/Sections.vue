<template>
  <div id="sections">
  <Scrollama
    :debug="false"
    :offset="0.8"
    @step-enter="handler"
  >
    <div class="step" data-source="UniqueImpact">
      <p>October 7, 2020</p>
      <br/>

      <h1>Despair of Disparity</h1>
      <h2>Examining the Covid-19 Impact on Labor.</h2>
      <p>By <a href="https://www.linkedin.com/in/maxim-podolski-95bbb0158/">Maxim Podolski</a></p>
      <br/>
      <p><i><small>This report was created with interactivity. Try hovering over some of the charts</small></i></p>
      <br/>
      <MarkdownItVue :content="step1"/>
    </div>
    
    <div v-for="step in steps" :key="step.key" class="step" :data-source="step.source">
      <MarkdownItVue :content="step.content" />
    </div>
  </Scrollama>
  </div>
</template>

<script>
import "intersection-observer";
import Scrollama from "vue-scrollama";
import 'buefy/dist/buefy.css'

import MarkdownItVue from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'

import step1 from "../assets/content/step1.md"
import step2 from "../assets/content/step2.md"
import step3 from "../assets/content/step3.md"
import step4 from "../assets/content/step4.md"
import step5 from "../assets/content/step5.md"
import step6 from "../assets/content/step6.md"
import step7 from "../assets/content/step7.md"
import step8 from "../assets/content/step8.md"
import step9 from "../assets/content/step9.md"
import step10 from "../assets/content/step10.md"

export default {
  name: "Sections",
  data: function() {
    return {
      stepIndex: 0,
      stepSource: "EMB",
      step1: step1,
      steps: [
        {content: '# TEST CASE', source: 'TestMulti', key: "TestMulti"},
        {content: '# TEST CASE', source: 'TestLine', key: "TestLine"},
        {content: '# TEST CASE', source: 'HoursImpact', key: "HoursImpact"},
        {content: step2, source: 'MonetaryPolicy', key: "MonetaryPolicy"},
        {content: step3, source: 'FiscalPolicy', key: "FiscalPolicy"},
        {content: step4, source: 'EmploymentByWage', key: "EmploymentByWage"},
        {content: step5, source: 'SpendingByIncome', key: "SpendingByIncome"},
        {content: step6, source: 'MathByIncome', key: "MathByIncome"},
        {content: step7, source: 'JobPostingByEducation', key: "JobPostingByEducation"},
        {content: step8, source: 'EmploymentByIndustry', key: "EmploymentByIndustry"},
        {content: step9, source: 'SpendingByIndustry', key: "SpendingByIndustry"},
        {content: step10, source: 'PandemicNumbers', key: "PandemicNumbers"}, //TODO: INCOME QUARTILE VS INCOME
      ]
    }
  },
  methods: {
    handler({element, index }) {
      //console.log(element, index, direction);
      //console.log(element.childNodes[0].innerText)

      this.stepIndex = index;
      this.stepSource = element.dataset.source;
      this.$emit('stepUpdate',{stepIndex: index, stepSource: this.stepSource})
      
      element.classList.add("active");
    }
  },
  components: {
    Scrollama,
    MarkdownItVue,
  },
};
</script>

<style scoped>
#sections {
  margin-top: 100px;
}

h2 {
  font-size: 120%;
}

.step {
  margin-bottom: 100px;
  margin-left: 20px;
  min-height: 700px;
  font-family: "Domine";
  font-weight: 400;
  line-height: 1.4em;
  text-align: justify;
  /*visibility: hidden;*/
  opacity: .3;
  transform: scale(0.8);
  transition: all 800ms;
  transform: translateY(60px);
}

.step.active {
  /*visibility: visible;*/
  opacity: 1;
  transform: translateY(0);
}
</style>
