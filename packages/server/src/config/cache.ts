import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const CACHE_DIR = '.mcpg';
export const DEFAULT_TTL = 86_400_000; // 1 day in ms

interface CacheMeta {
  timestamp: number;
  source: string;
}

function cachePath(
  configDir: string,
  namespace: string,
  name: string,
): string {
  return join(configDir, CACHE_DIR, namespace, `${name}.txt`);
}

function metaPath(
  configDir: string,
  namespace: string,
  name: string,
): string {
  return join(configDir, CACHE_DIR, namespace, `${name}.meta.json`);
}

export async function readCache(
  configDir: string,
  namespace: string,
  name: string,
  source: string,
  ttl: number,
): Promise<string | undefined> {
  try {
    const meta = JSON.parse(
      await readFile(metaPath(configDir, namespace, name), 'utf-8'),
    ) as CacheMeta;
    if (meta.source !== source) return undefined;
    if (Date.now() - meta.timestamp > ttl) return undefined;
    return await readFile(cachePath(configDir, namespace, name), 'utf-8');
  } catch {
    return undefined;
  }
}

export async function writeCache(
  configDir: string,
  namespace: string,
  name: string,
  source: string,
  content: string,
): Promise<void> {
  const dir = join(configDir, CACHE_DIR, namespace);
  await mkdir(dir, { recursive: true });
  await writeFile(cachePath(configDir, namespace, name), content);
  await writeFile(
    metaPath(configDir, namespace, name),
    JSON.stringify({ timestamp: Date.now(), source }),
  );
}
