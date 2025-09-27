import { promises as fs } from 'fs';
import path from 'path';

const root = process.cwd();
const distServer = path.join(root, 'dist', 'server', 'node-build.mjs');
const distSpaDir = path.join(root, 'dist', 'spa');
const outDir = path.join(root, 'build');

async function rimraf(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {}
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  // Validate inputs
  await fs.access(distServer).catch(() => {
    throw new Error('Missing dist/server build. Run "npm run build" first.');
  });
  await fs.access(distSpaDir).catch(() => {
    throw new Error('Missing client build in dist/spa. Run "npm run build" first.');
  });

  await rimraf(outDir);
  await fs.mkdir(outDir, { recursive: true });

  // Copy server entry into build/server to preserve ../spa relative path
  const serverOutDir = path.join(outDir, 'server');
  await fs.mkdir(serverOutDir, { recursive: true });
  await fs.copyFile(distServer, path.join(serverOutDir, 'server.mjs'));

  // Copy SPA assets
  await copyDir(distSpaDir, path.join(outDir, 'spa'));

  // Create minimal package.json for deployment
  const rootPkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf-8'));
  const buildPkg = {
    name: rootPkg.name || 'app-build',
    private: false,
    type: 'module',
    version: rootPkg.version || '1.0.0',
    description: rootPkg.description || '',
    scripts: {
      start: 'node server/server.mjs'
    },
    dependencies: rootPkg.dependencies || {},
    engines: rootPkg.engines || undefined
  };
  await fs.writeFile(path.join(outDir, 'package.json'), JSON.stringify(buildPkg, null, 2));

  // Prefer production installs only in this folder
  await fs.writeFile(path.join(outDir, '.npmrc'), 'production=true\n');

  console.log('Build folder created at ./build');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
