import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

Vue.use(Buefy);

Vue.use(VueResource);

Vue.http.headers.common['Access-Control-Allow-Origin'] = '*'
//Vue.http.options.emulateHTTP = true
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')