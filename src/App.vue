<template>
  <div id="app" class="columns is-mobile">
    <Sections class="column is-3-phone is-5-tablet is-6-desktop is-6-widescreen is-5-fullhd" @stepUpdate="handleStepUpdate"/>
    <Vis class="column is-9-phone is-7-tablet is-6-desktop is-6-widescreen is-6-fullhd"
        :stepIndex="stepIndex"
        :stepSource="stepSource"
    />
  </div>
</template>

<script>
import Sections from "./components/Sections.vue";
import Vis from "./components/Vis.vue";

export default {
  name: "App",
  data: function() {
    return {
      stepIndex: "0",
      stepSource: "UnemploymentCombined",
    };
  },
  methods: {
      handleStepUpdate(event) {
        this.stepIndex = event.stepIndex;
        this.stepSource = event.stepSource;
      }
  },
  components: {
    Sections,
    Vis,
  },
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@import url("https://fonts.googleapis.com/css?family=Merriweather&display=swap");
@import url("https://fonts.googleapis.com/css?family=Kosugi&display=swap");
@import url("https://fonts.googleapis.com/css?family=Domine:400,700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=EB+Garamond&display=swap");

body {
  background-color: rgb(245, 244, 241);
  overflow-x: hidden;
  height: 100%;
}

h1,
h2 {
  font-weight: 800;
  text-align: left;
  line-height: 32px;
}

h1 {
  font-size: 35px;
}

strong {
  color: rgb(245, 155, 155);
}

a {
  color: rgb(221, 0, 255);
  text-decoration: none;
}
</style>
