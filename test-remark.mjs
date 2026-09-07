import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkMediaDirectives from './src/utils/remarkMediaDirectives.ts';

const md = `::video{src=“/media/reports/sample-multimedia/demo.mp4” caption=“Demo”}`;

async function run() {
  const file = await unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkMediaDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  console.log(String(file));
}

run();
