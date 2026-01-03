const readline = require('readline');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');
const http = require('http');
const https = require('https');

const CYAN = '\x1b[36m', WHITE = '\x1b[97m', RESET = '\x1b[0m', RED = '\x1b[31m', DIM = '\x1b[2m';
const GREEN = '\x1b[32m', YELLOW = '\x1b[33m', BLUE = '\x1b[34m', MAGENTA = '\x1b[35m';

function lumaraLexer(code) {
    return code
        .replace(/:\s*(int|float|string|auto|long|byte|double|void|bool)\b/g, '')
        .replace(/\bvar\s+(int|float|string|auto|long|byte|double|bool)\b/g, 'let')
        .replace(/\bfunc\b/g, 'function')
        .replace(/::/g, '.')
        .replace(/out\s*<<\s*([\s\S]*?);/g, (match, content) => `print(${content.trim()});`);
}

const context = {
    print: (...args) => process.stdout.write(`${args.join(' ')}\n`),
    spawn: (cmd, args = []) => spawn(cmd, Array.isArray(args) ? args : [args], { detached: true, stdio: 'ignore' }).unref(),
    
    Console: {
        clear: () => console.clear(),
        color: (c) => {
            const colors = { cyan: CYAN, red: RED, green: GREEN, yellow: YELLOW, blue: BLUE, white: WHITE, magenta: MAGENTA };
            process.stdout.write(colors[c.toLowerCase()] || RESET);
        }
    },

    System: {
        os: { 
            ip: () => {
                const nets = os.networkInterfaces();
                for (const name of Object.keys(nets)) {
                    for (const net of nets[name]) if (net.family === 'IPv4' && !net.internal) return net.address;
                }
                return "127.0.0.1";
            },
            version: "6.0.0"
        },
        say: (txt) => { try { execSync(`powershell -Command "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${txt}')"`); } catch(e){} },
        wait: (ms) => new Promise(res => setTimeout(res, ms))
    },

    // NEW: Self-Update & External Data Engine
    Net: {
        get: (url) => new Promise((res, rej) => {
            https.get(url, { headers: { 'User-Agent': 'Lumara-Kernel' } }, (r) => {
                let d = ''; r.on('data', k => d += k); r.on('end', () => res(d));
            }).on('error', rej);
        }),
        webhook: (url, data) => {
            const d = JSON.stringify(data);
            const u = new URL(url);
            const req = https.request({
                hostname: u.hostname, path: u.pathname, method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': d.length }
            });
            req.write(d); req.end();
        }
    },

    // NEW: Full Web Server
    Server: {
        create: (port, routes) => {
            http.createServer((req, res) => {
                const content = routes[req.url] || routes['404'] || 'Not Found';
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }).listen(port);
            process.stdout.write(`${GREEN}[SERVER] Listening on port ${port}${RESET}\n`);
        }
    }
};

vm.createContext(context);

async function execute(raw, fileName = 'repl') {
    try {
        const js = `(async () => { ${lumaraLexer(raw)} \n})()`;
        await vm.runInContext(js, context, { filename: fileName });
    } catch (e) { process.stdout.write(`${RED}[!] KERNEL_PANIC:${RESET} ${e.message}\n`); }
}

// AUTO-UPDATE LOGIC
async function checkUpdates() {
    try {
        // Example: Checking a 'version.txt' on your GitHub repo
        // const remote = await context.Net.get("https://raw.githubusercontent.com/USER/REPO/main/version.txt");
        // if (remote.trim() !== context.System.os.version) { ... execute update ... }
    } catch(e) {}
}

const args = process.argv.slice(2);
if (args.length > 0) {
    execute(fs.readFileSync(path.resolve(args[0]), 'utf8'), args[0]);
} else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: `${CYAN}lumara > ${RESET}` });
    console.clear();
    process.stdout.write(`${CYAN}
    ██╗     ██╗   ██╗███╗   ███╗ █████╗ ██████╗  █████╗ 
    ██║     ██║   ██║████╗ ████║██╔══██╗██╔══██╗██╔══██╗
    ██║     ██║   ██║██╔████╔██║███████║██████╔╝███████║
    ██║     ██║   ██║██║╚██╔╝██║██╔══██║██╔══██╗██╔══██║
    ███████╗╚██████╔╝██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██║ v1.0.0
    ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
    ${RESET} [ STATUS: OPTIMISED ]\n\n`);
    rl.on('line', async (l) => { if (l.trim()) await execute(l); rl.prompt(); });
    rl.prompt();
}