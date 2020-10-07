<template>
  <div id="sections">
  <Scrollama
    :debug="false"
    :offset="0.8"
    @step-enter="handler"
  >
    <div class="step" data-source="UniqueImpact">
      <h1>What was Covid-19's Impact on Labor?</h1>
      <p>By <a href="https://www.linkedin.com/in/maxim-podolski-95bbb0158/">Maxim Podolski</a></p>
      <br/>
      <i><small>This report was created with interactivity. Try hovering over some of the charts</small></i>
      <br/><br/>
      <h2>Covid-19's Uniqueness</h2>
      <p>The pandemic posed a remarkable shock to the US economy, unmatched in impact by any prior recession. The chart on the right queries FRED for PAYEMS, which represents total nonfarm payroll. According to the St. Louis Fed, this approximates 80% of the workers who contribute to GDP. </p>
      <br/>
      <p>The chart exposes three major insights.</p>
      <br/>
      <p><b>First, no other recession in the last 70 years matches the severity of the pandemic.</b> In % job losses relative to the peak, the pandemic is nearly three times as dramatic as the 2007 financial crash.</p>
      <br/>
      <p><b>Second, and even more concerningly, the recovery has been slowing.</b> If this trend continues, the latter half of the recovery has the potential to meet the pace of the 2007 recovery which took over 2200 days to fully recover lost jobs.</p>
      <br/>
      <p><b>Third, labor markets have recovered slower relative to every new recession.</b> Prior to 1981, the recovery time ranged between ~200 to ~600 days. In order, the 1981 to 2001 labor market recoveries took about: 800 days, 1300 days, and 2200 days.</p>
      <br/>
    </div>
    <div class="step" data-source="MonetaryPolicy">
      <h1>... Despite Powerful Monetary Policy</h1>
      <p>Show Basic Montery</p>
    </div>
    <div class="step" data-source="UnemploymentCombined">
      <h1>Indeph look into Fiscal</h1>
      <p>Show Fiscal</p>
    </div>
  </Scrollama>
  </div>
</template>

<script>
import "intersection-observer";
import Scrollama from "vue-scrollama";
import 'buefy/dist/buefy.css'

export default {
  name: "Sections",
  data: function() {
    return {
      stepIndex: 0,
      stepSource: "EMB"
    }
  },
  components: {
    Scrollama,
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
  }
};
</script>

<style scoped>
#sections {
  margin-top: 100px;
}

.step {
  margin-bottom: 100px;
  margin-left: 20px;
  height: 700px;
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
