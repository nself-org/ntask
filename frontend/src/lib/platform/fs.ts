import { isTauri } from './index';

async function getTauriPlugin(name: string): Promise<Record<string, unknown> | null> {
  try {
    return await import(/* webpackIgnore: true */ `@tauri-apps/plugin-${name}`);
  } catch {
    return null;
  }
}

export async function readFile(path: string): Promise<string | null> {
  if (isTauri()) {
    try {
      const fs = await getTauriPlugin('fs');
      if (fs?.readTextFile) return await (fs.readTextFile as (p: string) => Promise<string>)(path);
    } catch { /* not available */ }
  }
  return null;
}

export async function writeFile(path: string, contents: string): Promise<boolean> {
  if (isTauri()) {
    try {
      const fs = await getTauriPlugin('fs');
      if (fs?.writeTextFile) {
        await (fs.writeTextFile as (p: string, c: string) => Promise<void>)(path, contents);
        return true;
      }
    } catch { /* not available */ }
  }
  return false;
}

export async function pickFile(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
  if (isTauri()) {
    try {
      const dialog = await getTauriPlugin('dialog');
      if (dialog?.open) {
        const result = await (dialog.open as (opts: unknown) => Promise<string | string[] | null>)({ filters, multiple: false });
        return typeof result === 'string' ? result : null;
      }
    } catch { /* not available */ }
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (filters) {
      input.accept = filters.flatMap((f) => f.extensions.map((e) => `.${e}`)).join(',');
    }
    input.onchange = () => resolve(input.files?.[0]?.name || null);
    input.click();
  });
}
