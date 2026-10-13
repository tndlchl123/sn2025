// @ts-check
import { defineConfig } from 'astro/config';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  integrations: [
    compress({
      HTML: true,       // HTML 압축 켜기
      CSS: true,        // CSS 압축 켜기
      JavaScript: true, // JS 압축 켜기
      Image: false,     // 이미지 압축 절대 금지
      SVG: false,       // SVG 이미지 압축 절대 금지
    })
  ]
});