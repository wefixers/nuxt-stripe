import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {

    },
  },
  plugins: [
    forms,
  ],
}
