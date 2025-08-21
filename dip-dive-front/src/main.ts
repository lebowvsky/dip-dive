import { createApp } from 'vue';
import App from './App.vue';
import { router } from '@/router/router';
import * as icons from './icons';
import { OhVueIcon, addIcons } from 'oh-vue-icons';

addIcons(...Object.values(icons));

const app = createApp(App);
app.component('VIcon', OhVueIcon).use(router).mount('#app');
