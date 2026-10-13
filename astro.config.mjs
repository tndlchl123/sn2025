// @ts-check
import { defineConfig } from 'astro/config';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  integrations: [
    compress({
      Image: false, // 범인이었던 이미지 강제 압축 기능만 끕니다!
    })
  ]
});