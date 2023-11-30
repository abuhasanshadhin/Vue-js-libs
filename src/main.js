import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import i18n from './plugins/i18n'
import enTrans from './lang/en.json'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(i18n, {
    default: {
        locale: 'en',
        lang: enTrans,
    },
})

app.mount('#app')
