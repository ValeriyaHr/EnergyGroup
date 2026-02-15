import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import path from 'path'

export default defineConfig({
    base: '/EnergyGroup/',
    plugins: [
        handlebars({
            partialDirectory: path.resolve(__dirname, 'components'),
        }),
    ],
})

