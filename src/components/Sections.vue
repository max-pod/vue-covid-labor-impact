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
      <h2>Covid-19's Uniqueness</h2>
      <p>Covid 19 poses a remarkable shock to our economy, unmatched with prior recessions. </p>
    </div>
    <div class="step" data-source="MonetaryPolicy">
      <h1>Despite the ....</h1>
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
