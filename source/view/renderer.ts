// Fontawesome
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/regular.css';
import '@Web/styles/app.less';

// Vuejs, Bootstrap, Bootstrap-vue
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
// App
import MainView from '@Web/components/main.vue';
import RimmodPage from '@Web/components/rimmod-page/rimmod-page.vue';
import ConfigPage from '@Web/components/config-page/config-page.vue';
import { store } from '@/view/store/store';
import translations from '@/common/translation';

Vue.use(VueI18n);
Vue.use(VueRouter);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

const router = new VueRouter({
  routes: [
    { path: '/rimmod', component: RimmodPage },
    { path: '/config', component: ConfigPage },
  ],
});
router.push('/rimmod');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mainView = new MainView({
  el: '#rootView',
  router,
  store,
  i18n: new VueI18n({
    locale: 'en',
    messages: translations,
    fallbackLocale: 'en'
  }),
  watch: {
    // Gère le changement de langue de l'application
    '$store.state.config.APP_LANGUAGE': {
      immediate: true,
      handler: function (newValue: string) {
        this.$i18n.locale = newValue;
      }
    }
  }
});
