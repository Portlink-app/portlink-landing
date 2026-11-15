#!/usr/bin/env node
// Chose launchd over tool-owned background processes so shared previews survive
// the session. This service owns only port 4320; Tailscale routes are unchanged.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const label = 'app.portlink.landing-preview-4320';
const domain = `gui/${process.getuid?.()}`;
const target = `${domain}/${label}`;
const plist = join(homedir(), 'Library', 'LaunchAgents', `${label}.plist`);
const logs = join(homedir(), 'Library', 'Logs', 'PortlinkLandingPreview');
const next = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const local = 'http://127.0.0.1:4320/';
const command = process.argv[2];
const xml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const string = (value) => `<string>${xml(value)}</string>`;
const args = [process.execPath, next, 'start', '--hostname', '127.0.0.1', '--port', '4320'];
const config = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key>${string(label)}
<key>ProgramArguments</key><array>${args.map(string).join('')}</array>
<key>WorkingDirectory</key>${string(root)}
<key>EnvironmentVariables</key><dict><key>PATH</key>${string(`${dirname(process.execPath)}:/usr/bin:/bin:/usr/sbin:/sbin`)}<key>NODE_ENV</key><string>production</string></dict>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>5</integer>
<key>StandardOutPath</key>${string(join(logs, 'server.log'))}
<key>StandardErrorPath</key>${string(join(logs, 'server.err'))}
</dict></plist>
`;

function run(program, parameters, required = true) {
  const result = spawnSync(program, parameters, { encoding: 'utf8' });
  if (required && result.status !== 0) throw new Error(result.error?.message || result.stderr || `${program} exited ${result.status}`);
  return result;
}

function built() {
  if (!existsSync(next) || !existsSync(join(root, '.next', 'BUILD_ID'))) {
    throw new Error('Missing optimized build. Stop this service, then run npm ci and npm run build before starting it.');
  }
  const manifest = JSON.parse(readFileSync(join(root, '.next', 'prerender-manifest.json'), 'utf8'));
  if (!manifest.routes['/'] || !manifest.routes['/contact']) throw new Error('Build is missing the landing or contact route. Rebuild before starting.');
}

function owned() {
  if (!existsSync(plist)) return;
  const saved = JSON.parse(run('/usr/bin/plutil', ['-convert', 'json', '-o', '-', plist]).stdout);
  if (saved.Label !== label || saved.WorkingDirectory !== root || saved.ProgramArguments?.[1] !== next) {
    throw new Error(`Refusing to replace a service owned by another checkout: ${plist}`);
  }
}

async function healthy(base = local) {
  for (const path of ['/', '/contact/']) {
    const page = new URL(path, base);
    const response = await fetch(page, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`${page} returned ${response.status}`);
    const html = await response.text();
    if (!html.includes('Portlink') || !html.includes('<h1')) throw new Error(`${page} is not the expected Portlink page`);
    const assets = [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"<>]+)"/g)].map((match) => match[1]))];
    if (!assets.some((asset) => asset.endsWith('.js')) || !assets.some((asset) => asset.endsWith('.css'))) throw new Error(`${page} has no application scripts or styles`);
    await Promise.all(assets.map(async (asset) => {
      const result = await fetch(new URL(asset, base), { signal: AbortSignal.timeout(5000) });
      if (!result.ok || result.headers.get('content-type')?.includes('text/html')) throw new Error(`Asset failed: ${asset} (${result.status})`);
      await result.arrayBuffer();
    }));
    console.log(`${page}: ${response.status}, ${assets.length} application assets loaded`);
  }
}

async function ready() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(local, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return healthy();
    } catch { /* launchd may still be starting Next */ }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(`Preview did not become ready. Inspect ${join(logs, 'server.err')}`);
}

try {
  if (command === 'check') {
    await healthy(process.argv[3] || local);
  } else {
    if (process.platform !== 'darwin') throw new Error('The persistent preview service requires macOS launchd.');
    if (!['print', 'start', 'restart', 'stop', 'status'].includes(command)) throw new Error('Usage: node scripts/preview-service.mjs print|start|restart|stop|status|check [URL]');
    owned();
    const loaded = run('/bin/launchctl', ['print', target], false);
    if (loaded.status === 0 && !loaded.stdout.includes(`path = ${plist}\n`)) throw new Error('Loaded service uses another plist; refusing to change it.');
    if (command === 'print') {
      built();
      console.log(config);
    } else if (command === 'status') {
      if (loaded.status !== 0) throw new Error('Preview service is stopped. Run the start command.');
      console.log(loaded.stdout.split('\n').filter((line) => /^\s*(state|pid|runs|last exit code|path|program|working directory) =/.test(line)).join('\n'));
      await healthy();
    } else if (command === 'stop') {
      if (loaded.status === 0) run('/bin/launchctl', ['bootout', target]);
      console.log(`${label}: stopped`);
    } else {
      built();
      if (loaded.status === 0 && command === 'restart') run('/bin/launchctl', ['kickstart', '-k', target]);
      else if (loaded.status !== 0) {
        // Do not attach a supervisor to a port already owned by an unmanaged server.
        const listener = run('/usr/sbin/lsof', ['-nP', '-iTCP@127.0.0.1:4320', '-sTCP:LISTEN'], false);
        if (listener.status === 0) throw new Error('Loopback port 4320 is already occupied. Identify and stop its owner before starting this service.');
        mkdirSync(dirname(plist), { recursive: true });
        mkdirSync(logs, { recursive: true });
        writeFileSync(plist, config, { mode: 0o600 });
        run('/usr/bin/plutil', ['-lint', plist]);
        run('/bin/launchctl', ['bootstrap', domain, plist]);
      }
      await ready();
      console.log(`${label}: running under launchd, independent of the tool session`);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
