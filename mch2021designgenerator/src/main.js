import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";
import App from './App.vue'
import './assets/css/styles.scss';
import {BootstrapVue} from 'bootstrap-vue'
import VueI18n from 'vue-i18n'

Vue.use(Vuex);
Vue.use(BootstrapVue)
Vue.use(VueI18n)

Vue.config.productionTip = false;

const store = new Vuex.Store({
    state: {
        settings: {},
    },

    mutations: {
        set_settings(state, value) {
            state.settings = value;
        },
    },

    plugins: [createPersistedState()],
});


const i18n = new VueI18n({
    locale: 'en',
    fallbackLocale: 'en',
    silentFallbackWarn: true,
    // it's required this is called messages.
    messages: {},
    sharedMessages: {}
});

// global functions
Vue.mixin({
    mounted: function () {
        this.$i18n.locale = this.setting("language");
    },
    methods: {
        setting: function (key) {
            // console.log(`Requested setting ${key}.`)
            // support 1 layer nested settings
            let value = 0;
            if (key.includes(".")) {
                let nested = key.split(".")
                value = this.$store.state.settings[nested[0]][nested[1]];
            } else {
                value = this.$store.state.settings[key];
            }
            if (value === undefined || value === null)
                return 0
            return value
        },
    }
})

new Vue({
    i18n,
    store,
    render: h => h(App),
}).$mount('#app')
