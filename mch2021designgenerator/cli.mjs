#!/usr/bin/env node
import { ArgumentParser } from 'argparse';
import fs from 'fs';
import net from 'net';
import paper from 'paper';
import readline from 'readline';
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
parser.add_argument('-s', '--service', { help: 'Run as a service, argument being the socket'})

const global_args = parser.parse_args();

// Gather all state data from the current module plus 1st-level dependents
let global_state = {
    ...concept.mixins.map(mixin => 'data' in mixin ? mixin.data() : {}).reduce((prev, cur) => ({...prev, ...cur})),
    ...concept.data(),
}

// Gather all module methods plus 1st-level dependents
const methods = {
    ...Object.fromEntries(
        concept.mixins.map(mixin =>
            Object.entries(mixin.methods),
        ).reduce((prev, cur) => ([...prev, ...cur])),
    ),
    ...Object.fromEntries(Object.entries(concept.methods)),
};

function run(args) {
    const state = JSON.parse(JSON.stringify(global_state))

    args = {
        ...global_args,
        ...args,
    };

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

    // Assign methods to the module state
    Object.entries(methods).forEach(([name, fn]) => state[name] = fn.bind(state));

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

    state.generateHexagon();

    return state.paperScope.project.exportSVG({asString: true});
}

if (global_args.service) {
    const server = net.createServer(socket => {
        const int = readline.createInterface(socket, socket);
        int.on('line', line => {
            try {
                const data = JSON.parse(line);
                if (typeof data !== "object") {
                    socket.write(JSON.stringify({
                        success: false,
                        msg: 'Input data is not an object',
                    })+'\n');
                }
                socket.write(JSON.stringify({
                    success: true,
                    data: run(data),
                }) + '\n')
                if ('close' in data && data.close) {
                    socket.end();
                }
            } catch(e) {
                console.error(e);
                socket.write(JSON.stringify({
                    success: false,
                    msg: 'An exception occurred',
                    data: e
                }) + '\n')
            }
        });
    });
    server.listen(global_args.service);
    console.log('Listening...');
} else {
    fs.writeFileSync(global_args.output, run(global_args));
}

