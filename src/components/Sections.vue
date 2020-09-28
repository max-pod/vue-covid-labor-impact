<template>
  <div id="sections">
  <Scrollama
    :debug="false"
    :offset="0.8"
    @step-enter="handler"
  >
    <div class="step" data-source="UnemploymentCombined">
      <h1>What was Covid-19's Impact on Labor?</h1>
      <p>By <a href="https://www.linkedin.com/in/maxim-podolski-95bbb0158/">marco fucking polo</a></p>
      <p>Show Basic Unemployment Graph.</p>
    </div>
    <div class="step" data-source="MonetaryPolicy">
      <h1>Despite the ....</h1>
      <p>Show Basic Montery</p>
    </div>
    <div class="step" data-source="FiscalPolicy">
      <h1>Indeph look into Fiscal</h1>
      <p>Show Fiscal</p>
    </div>
  </Scrollama>
  </div>
</template>

<script>
import "intersection-observer";
import Scrollama from "vue-scrollama";

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
  position: relative;
  display: inline-block;
  width: 400px;
  top: 60px;
  z-index: 90;
  margin-right: 50px;
}

.step {
  margin-bottom: 100px;
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
