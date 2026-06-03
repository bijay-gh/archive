import fs from 'node:fs';
import path from 'node:path';

export interface Warning {
  type: string;
  file: string;
  message: string;
}

const warnings: Warning[] = [];

export function logWarning(type: string, file: string, message: string) {
  warnings.push({ type, file, message });
  console.warn(`[WARN] ${type}: ${file}\n  -> ${message}`);
}

export function getWarnings(): Warning[] {
  return warnings;
}

export function clearWarnings() {
  warnings.length = 0;
}

export function validateLocalFile(src: string, currentFile?: string): boolean {
  if (!src) return false;
  
  try {
    let fullPath = src;
    if (src.startsWith('/')) {
      fullPath = path.join(process.cwd(), 'public', src);
    } else if (currentFile) {
      fullPath = path.resolve(path.dirname(currentFile), src);
    } else {
      fullPath = path.resolve(process.cwd(), src);
    }
    return fs.existsSync(fullPath);
  } catch (e) {
    return false;
  }
}

export async function validateUrl(url: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(id);
    // If it's a 4xx or 5xx it's likely broken. 403 might be anti-bot, but acceptable to flag.
    return res.ok;
  } catch (e) {
    return false;
  }
}
