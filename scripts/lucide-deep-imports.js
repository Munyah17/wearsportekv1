// One-shot codemod: `import { A, B as C } from 'lucide-react-native'`
// -> per-icon deep imports so Metro only bundles the icons actually used.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIRS = ['app', 'components', 'lib'];

// lucide v1.x renames
const RENAME = { CheckCircle2: 'circle-check-big', XCircle: 'circle-x', Trash2: 'trash' };

const kebab = (n) =>
  RENAME[n] ||
  n
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d+)/g, '$1-$2')
    .toLowerCase();

const IMPORT_RE = /import\s*{([^};]*)}\s*from\s*'lucide-react-native';?/g;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) yield p;
  }
}

let changed = 0;
for (const d of DIRS) {
  const abs = path.join(ROOT, d);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const src = fs.readFileSync(file, 'utf8');
    if (!src.includes('lucide-react-native')) continue;
    const out = src.replace(IMPORT_RE, (m, names) => {
      const imports = names
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((part) => {
          const [orig, alias] = part.split(/\s+as\s+/).map((s) => s.trim());
          const local = alias || orig;
          const iconFile = kebab(orig);
          const full = `lucide-react-native/dist/esm/icons/${iconFile}.mjs`;
          const disk = path.join(ROOT, 'node_modules', ...full.split('/')) ;
          if (!fs.existsSync(disk)) throw new Error(`${file}: missing icon file ${iconFile}.mjs (from ${orig})`);
          return `import ${local} from '${full}';`;
        });
      return imports.join('\n');
    });
    if (out !== src) {
      fs.writeFileSync(file, out);
      changed++;
      console.log('rewrote', path.relative(ROOT, file));
    }
  }
}
console.log(`done — ${changed} files rewritten`);
