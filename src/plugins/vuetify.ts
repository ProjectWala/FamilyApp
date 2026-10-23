/**
 * plugins/vuetify.ts
 *
 * Configured with Mantis Vuetify Admin Template Design System
 */

import { type ThemeDefinition, createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

const light: ThemeDefinition = {
  dark: false,
  variables: {
    'border-color': '#f0f0f0',
    'border-opacity': 1,
    'carousel-control-size': 10,
    gradient:
      'linear-gradient(250.38deg, rgba(var(--v-theme-primary), var(--v-shadow-opacity)) 2.39%, rgba(var(--v-theme-primary), var(--v-half-opacity)) 34.42%, rgb(var(--v-theme-primary)) 60.95%, rgba(var(--v-theme-darkprimary), var(--v-medium-opacity)) 84.83%, rgb(var(--v-theme-darkprimary)) 104.37%)',
    gradientRtl:
      'linear-gradient(250.38deg, rgb(var(--v-theme-darkprimary)) 2.39%, rgba(var(--v-theme-darkprimary), var(--v-medium-opacity)) 34.42%, rgb(var(--v-theme-primary)) 60.95%, rgba(var(--v-theme-primary), var(--v-half-opacity)) 84.83%, rgba(var(--v-theme-primary), var(--v-shadow-opacity)) 104.37%)',
    gradient2: 'linear-gradient(to right, rgb(var(--v-theme-darkprimary)), rgb(var(--v-theme-primary)))',
    'card-shadow': '0px 2px 8px rgba(0, 0, 0, 0.08)',
    'gradient-opacity': 0.2,
    'medium-opacity': 0.85,
    'chart-opacity': 0.6,
    'half-opacity': 0.5,
    'high-opacity': 1,
    'shadow-opacity': 0.08,
    'high-emphasis-opacity': 1,
    'list-item-subtitle-opacity': 1,
    'activated-opacity': 0.083,
    'custom-shadows-primary': '0 0 0 2px rgba(var(--v-theme-primary), 0.2)',
    'custom-shadows-secondary': '0 0 0 2px rgba(var(--v-theme-secondary), 0.2)',
    'custom-shadows-success': '0 0 0 2px rgba(var(--v-theme-success), 0.2)',
    'custom-shadows-info': '0 0 0 2px rgba(var(--v-theme-info), 0.2)',
    'custom-shadows-warning': '0 0 0 2px rgba(var(--v-theme-warning), 0.2)',
    'custom-shadows-error': '0 0 0 2px rgba(var(--v-theme-error), 0.2)',
    'shadow-1': '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    'select-dropdown-shadow': '0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
  colors: {
    primary: '#1677ff',
    secondary: '#8c8c8c',
    info: '#13c2c2',
    success: '#52c41a',
    accent: '#FFAB91',
    warning: '#faad14',
    error: '#ff4d4f',
    lightprimary: '#e6f4ff',
    lightsecondary: '#f5f5f5',
    lightsuccess: '#EAFCD4',
    lighterror: '#fff1f0',
    lightwarning: '#FFF6D0',
    lightinfo: '#e6fffb',
    darkText: '#262626',
    lightText: '#8c8c8c',
    darkprimary: '#0958d9',
    darksecondary: '#262626',
    darkinfo: '#006d75',
    darksuccess: '#237804',
    darkwarning: '#ad6800',
    darkerror: '#a8071a',
    borderLight: '#e4e7ed',
    inputBorder: '#a1a1a5',
    containerBg: '#f0f2f5',
    background: '#f0f2f5',
    surface: '#ffffff',
    'on-surface': '#262626',
    'on-surface-variant': '#ffffff',
    'surface-light': '#f0f2f5',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#f5f5f5',
    gray200: '#d9d9d9',
    gray300: '#595959',
    gray400: '#f0f0f0',
    primary100: '#e6f4ff',
    primary200: '#a1d2ff',
    secondary200: '#eeeeee',
  },
}

const dark: ThemeDefinition = {
  dark: true,
  variables: {
    'border-color': '#303030',
    'border-opacity': 1,
    'carousel-control-size': 10,
    gradient:
      'linear-gradient(250.38deg, rgba(var(--v-theme-primary), var(--v-shadow-opacity)) 2.39%, rgba(var(--v-theme-primary), var(--v-half-opacity)) 34.42%, rgb(var(--v-theme-primary)) 60.95%, rgba(var(--v-theme-darkprimary), var(--v-medium-opacity)) 84.83%, rgb(var(--v-theme-darkprimary)) 104.37%)',
    gradientRtl:
      'linear-gradient(250.38deg, rgb(var(--v-theme-darkprimary)) 2.39%, rgba(var(--v-theme-darkprimary), var(--v-medium-opacity)) 34.42%, rgb(var(--v-theme-primary)) 60.95%, rgba(var(--v-theme-primary), var(--v-half-opacity)) 84.83%, rgba(var(--v-theme-primary), var(--v-shadow-opacity)) 104.37%)',
    gradient2: 'linear-gradient(to right, rgb(var(--v-theme-darkprimary)), rgb(var(--v-theme-primary)))',
    'card-shadow': '0px 2px 8px rgba(0, 0, 0, 0.45)',
    'gradient-opacity': 0.2,
    'medium-opacity': 0.85,
    'chart-opacity': 0.6,
    'half-opacity': 0.5,
    'high-opacity': 1,
    'shadow-opacity': 0.16,
    'high-emphasis-opacity': 1,
    'list-item-subtitle-opacity': 1,
    'activated-opacity': 0.083,
    'custom-shadows-primary': '0 0 0 2px rgba(var(--v-theme-primary), 0.3)',
    'custom-shadows-secondary': '0 0 0 2px rgba(var(--v-theme-secondary), 0.3)',
    'custom-shadows-success': '0 0 0 2px rgba(var(--v-theme-success), 0.3)',
    'custom-shadows-info': '0 0 0 2px rgba(var(--v-theme-info), 0.3)',
    'custom-shadows-warning': '0 0 0 2px rgba(var(--v-theme-warning), 0.3)',
    'custom-shadows-error': '0 0 0 2px rgba(var(--v-theme-error), 0.3)',
    'shadow-1': '0px 2px 1px -1px rgba(0,0,0,0.5),0px 1px 1px 0px rgba(0,0,0,0.35),0px 1px 3px 0px rgba(0,0,0,0.3)',
    'select-dropdown-shadow': '0 9px 28px 8px rgba(0, 0, 0, 0.35)',
  },
  colors: {
    primary: '#1677ff',
    secondary: '#8c8c8c',
    info: '#13c2c2',
    success: '#52c41a',
    accent: '#FFAB91',
    warning: '#faad14',
    error: '#ff4d4f',
    lightprimary: '#111d2c',
    lightsecondary: '#1f1f1f',
    lightsuccess: '#162312',
    lighterror: '#2a1215',
    lightwarning: '#2b2111',
    lightinfo: '#11252b',
    darkText: '#f0f0f0',
    lightText: '#8c8c8c',
    darkprimary: '#0958d9',
    darksecondary: '#bfbfbf',
    borderLight: '#303030',
    inputBorder: '#434343',
    containerBg: '#141414',
    background: '#141414',
    surface: '#1f1f1f',
    'on-surface': '#f0f0f0',
    'on-surface-variant': '#141414',
    'surface-light': '#262626',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#1f1f1f',
    gray200: '#2a2a2a',
    gray300: '#8c8c8c',
    gray400: '#303030',
    primary100: '#111d2c',
    primary200: '#173456',
    secondary200: '#262626',
  },
}

export default createVuetify({
  display: {
    thresholds: {
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1266,
      xl: 1440,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light,
      dark,
    },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: 'lg',
    },
    VBtnGroup: {
      VBtn: {
        color: 'darkText',
      },
    },
    VCard: {
      rounded: 'lg',
    },
    VField: {
      baseColor: 'inputBorder',
      color: 'primary',
      rounded: 'lg',
    },
    VAutoComplete: {
      color: 'primary',
    },
    VTextField: {
      rounded: 'lg',
      variant: 'outlined',
      baseColor: 'inputBorder',
      color: 'primary',
    },
    VTextarea: {
      rounded: 'lg',
      variant: 'outlined',
      color: 'primary',
    },
    VTooltip: {
      location: 'top',
    },
    VChip: {
      rounded: 'md',
    },
    VDialog: {
      VCard: {
        rounded: 'lg',
      },
    },
    VAvatar: {
      color: 'primary',
      variant: 'tonal',
      style: 'font-size: 15px; --v-activated-opacity: 0.0825',
      VIcon: {
        size: '16px',
      },
    },
    VBadge: {
      VIcon: {
        size: '18px',
      },
    },
    VProgressLinear: {
      height: 6,
      rounded: 'lg',
    },
    VSelect: {
      rounded: 'lg',
      variant: 'outlined',
      baseColor: 'inputBorder',
      color: 'primary',
    },
    VList: {
      rounded: 'lg',
      VListItemSubtitle: {
        style: 'font-size: 0.7rem;line-height: 1.5',
      },
      VListItem: {
        VAvatar: {
          variant: 'tonal',
        },
      },
    },
  },
})
