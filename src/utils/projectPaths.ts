
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Runtime path helpers that stay stable even when the host launches the
 * server with an unexpected working directory (for example Windows system32).
 */

import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

function findPackageRoot(fromDir: string): string | undefined {
  let currentDir = fromDir;

  while (true) {
    if (existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return undefined;
    }
    currentDir = parentDir;
  }
}

export function resolvePackageRoot(moduleUrl: string): string {
  const packageRoot = findPackageRoot(path.dirname(fileURLToPath(moduleUrl)));
  return packageRoot ?? process.cwd();
}

export function resolveDefaultArtifactsTasksDir(moduleUrl: string): string {
  return path.join(resolvePackageRoot(moduleUrl), 'artifacts', 'tasks');
}

export function resolveDefaultDebuggerSessionsDir(moduleUrl: string): string {
  return path.join(resolvePackageRoot(moduleUrl), 'debugger-sessions');
}

export function resolveDefaultCodeCacheDir(moduleUrl: string): string {
  return path.join(resolvePackageRoot(moduleUrl), '.cache', 'code');
}

export function resolveDefaultEnvPath(moduleUrl: string): string {
  return path.join(resolvePackageRoot(moduleUrl), '.env');
}
