import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import "normalize.css"
import 'element-plus/dist/index.css'
import 'highlight.js/styles/agate.css'
import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";

const app = createApp(App)
app.use(ElementPlus)
app.use(hljsVuePlugin)
app.mount('#app')
