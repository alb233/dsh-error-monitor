/**
 * Loads the client bundle the way the browser module loader does, with React and
 * the loader stubbed, so a module-scope mistake fails here instead of in the GUI.
 * Run: node tools/check-client-load.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, '..', 'client.js');
const src = fs.readFileSync(file, 'utf8');

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  window: {
    __ModuleLoader__: {
      load(mod) {
        sandbox.__mod = mod;
      },
    },
  },
};
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'client.js' });

const mod = sandbox.__mod;
if (!mod || typeof mod.factory !== 'function') {
  console.error('loader did not capture a module definition');
  process.exit(1);
}

const react = {
  createElement() {
    return null;
  },
  useState() {
    return [undefined, () => {}];
  },
  useEffect() {},
  useMemo(fn) {
    return fn();
  },
  useCallback(fn) {
    return fn;
  },
  useRef() {
    return { current: null };
  },
  useSyncExternalStore() {
    return undefined;
  },
};

let exportsObj;
try {
  exportsObj = mod.factory((name) => {
    if (name === 'react') return react;
    throw new Error('unexpected require: ' + String(name));
  });
} catch (error) {
  console.error('factory threw: ' + String(error && error.stack ? error.stack : error));
  process.exit(1);
}

if (!exportsObj || !Array.isArray(exportsObj.inject) || typeof exportsObj.apply !== 'function') {
  console.error('factory did not return the expected plugin exports');
  process.exit(1);
}

console.log('client bundle loads; inject=' + JSON.stringify(exportsObj.inject));
