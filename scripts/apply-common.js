/**
 * 批量为所有 index.html 应用公共片段优化
 * 运行: node scripts/apply-common.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const HEAD_OLD = /<link rel="stylesheet" type="text\/css" href="\/css\/my\.css">\s*\n\s*<script src="\/libs\/jquery\/jquery\.min\.js"><\/script>\s*\n\s*<meta name="generator"[^>]*>\s*\n\s*<style>\.github-emoji[\s\S]*?<\/style>\s*\n\s*<\/head>/;
const HEAD_NEW = `<link rel="stylesheet" type="text/css" href="/css/my.css">
    <link rel="stylesheet" type="text/css" href="/css/common.css">

    <script src="/libs/jquery/jquery.min.js"></script>
</head>`;

const MATERIALIZE_SCRIPT = '<script src="/libs/materialize/materialize.min.js"></script>';
const FOOTER_PLACEHOLDER = `    <div id="site-footer"></div>

    <script src="/js/load-common.js"></script>
    ${MATERIALIZE_SCRIPT}`;

function findHtmlFiles(dir, list) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'libs' && e.name !== 'scripts' && e.name !== 'partials' && e.name !== 'css' && e.name !== 'js' && e.name !== 'live2dw' && e.name !== 'medias' && e.name !== 'img') {
            findHtmlFiles(full, list);
        } else if (e.name === 'index.html') {
            list.push(full);
        }
    }
}

const files = [];
findHtmlFiles(root, files);
const toProcess = files.filter(f => !f.replace(/\\/g, '/').endsWith('404/index.html'));

let ok = 0;
let skip = 0;
let fail = 0;

for (const file of toProcess) {
    let html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(root, file);

    if (html.includes('common.css') && html.includes('site-header')) {
        skip++;
        continue;
    }

    if (!html.includes('common.css')) {
        const m = html.match(HEAD_OLD);
        if (!m) {
            console.warn('Head not matched: ' + rel);
            fail++;
            continue;
        }
        html = html.replace(HEAD_OLD, HEAD_NEW);
    }

    if (!html.includes('id="site-header"')) {
        const bodyIdx = html.indexOf('<body>');
        const headerIdx = html.indexOf('<header class="navbar-fixed">', bodyIdx);
        const headerEndIdx = html.indexOf('</header>', headerIdx);
        if (bodyIdx === -1 || headerIdx === -1 || headerEndIdx === -1) {
            console.warn('Header not found: ' + rel);
            fail++;
            continue;
        }
        const headerEndPos = headerEndIdx + '</header>'.length;
        html = html.slice(0, bodyIdx + '<body>'.length) + '\n    <div id="site-header"></div>\n\n' + html.slice(headerEndPos);
    }

    if (!html.includes('id="site-footer"')) {
        const footerIdx = html.indexOf('<footer class="page-footer bg-color">');
        const scriptIdx = html.indexOf(MATERIALIZE_SCRIPT, footerIdx);
        if (footerIdx === -1 || scriptIdx === -1) {
            console.warn('Footer/materialize not found: ' + rel);
            fail++;
            continue;
        }
        html = html.slice(0, footerIdx) + FOOTER_PLACEHOLDER + html.slice(scriptIdx + MATERIALIZE_SCRIPT.length);
    }

    fs.writeFileSync(file, html, 'utf8');
    ok++;
}

console.log('Updated:', ok, 'Skipped:', skip, 'Failed:', fail);
