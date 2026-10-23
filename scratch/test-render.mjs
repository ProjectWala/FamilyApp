import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia } from 'pinia'
import GuestsList from './src/components/GuestsList.vue'

// Basic test to see if GuestsList imports and initializes without error
console.log('GuestsList loaded:', !!GuestsList)
