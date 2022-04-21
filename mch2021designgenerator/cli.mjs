#!/usr/bin/env node
import { ArgumentParser } from 'argparse';
import fs from 'fs';
import paper from 'paper';
import shajs from 'sha.js';

import { default as concept } from './src/components/renderers/concept_3.mjs';

const parser = new ArgumentParser({
    description: 'Design generator'
});
parser.add_argument('-w', '--width', { type: 'int', help: 'Image width', default: 1920 });
parser.add_argument('-t', '--height', { type: 'int', help: 'Image height', default: 1080 });
parser.add_argument('-b', '--black', { help: 'Black/White image', action: 'store_true', default: false });
parser.add_argument('-n', '--name', { help: 'Username', default: 'MCH2022'})
parser.add_argument('-o', '--output', { help: 'Output filename', default: 'output.svg'})

const args = parser.parse_args();
const settings = {
    seed: shajs('sha1').update(args.name).digest('hex'),
    seed_input: args.name,
    useStandardColorPalette: true,
    maximumRandomColors: 4,
    currentBlendMode: 'normal',
    triangleOpacity: 1,
    lineOpacity: 1,
    barOpacity: 1,
    kaleidoscope_dna: {
        lines: 0,
        circles: 0,
        hackers: 0,
        star: 0,
        custom: 0,
        emoji: 0,
        monochrome: args.black,
        fillBackground: true,
        allow_mystery_hacker: true,
    },
    animate: false,
    font_sync: true,
    width: args.width,
    height: args.height
};

// Gather all state data from the current module plus 1st-level dependents
let state = {
    ...concept.mixins.map(mixin => 'data' in mixin ? mixin.data() : {}).reduce((prev, cur) => ({...prev, ...cur})),
    ...concept.data(),
}

// Gather all module methods plus 1st-level dependents
const methods = {
    ...Object.fromEntries(
        concept.mixins.map(mixin =>
            Object.entries(mixin.methods).map(([k, v]) => [k, v.bind(state)]),
        ).reduce((prev, cur) => ([...prev, ...cur])),
    ),
    ...Object.fromEntries(Object.entries(concept.methods).map(([k, v]) => [k, v.bind(state)])),
};
// Assign methods to the module state
Object.entries(methods).forEach(([name, fn]) => state[name] = fn);

state.setting = name => {
    let val = settings;
    name.split('.').forEach(x => val = val[x]);
    return val;
}

// We don't need Vue-isms
state.$root = {
    $on: () => undefined,
};

const size = new paper.Size(settings.width, settings.height);
state.paperScope = paper.setup(size);
state.font = `public/${state.font}`;

// Run mounted hooks for state initialization
concept.mixins.forEach(mixin => 'mounted' in mixin ? mixin.mounted.bind(state)() : undefined);

methods.generateHexagon();

fs.writeFileSync(args.output, state.paperScope.project.exportSVG({asString: true}));
