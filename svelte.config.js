import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx', '.md'],
			smartypants: {
				quotes: true,
				ellipses: true,
				dashes: true
			}
		})
	],
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		alias: {
			$components: 'src/lib/components',
			$server: 'src/lib/server'
		}
	}
};

export default config;
