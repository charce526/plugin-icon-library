import React from 'react';
import { CustomIcon, SvgDefinition, SvgNode, validateDefinition } from '../svg';
import { wrapIcon } from './IconComponent';
import { presetSize } from './iconSize';

export function parseSvg(source: string): SvgDefinition {
  if (source.length > 50000 || /<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('SVG exceeds limits');
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') throw new Error('Invalid SVG');
  const readAttrs = (element: Element) => Object.fromEntries([...element.attributes]
    .filter((attr) => !['xmlns', 'viewBox', ...(element === doc.documentElement ? ['width', 'height'] : [])].includes(attr.name))
    .map((attr) => [attr.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), attr.value]));
  const visit = (element: Element): SvgNode => ({ tag: element.localName, attrs: readAttrs(element), children: [...element.children].map(visit) });
  return validateDefinition({ viewBox: doc.documentElement.getAttribute('viewBox'), attrs: readAttrs(doc.documentElement), nodes: [...doc.documentElement.children].filter((n) => !['title', 'desc'].includes(n.localName)).map(visit) });
}

export function customComponent(definition: SvgDefinition) {
  const data = validateDefinition(definition);
  const node = (item: SvgNode, index: number): React.ReactNode => React.createElement(item.tag, { ...item.attrs, key: index }, ...(item.children || []).map(node));
  return wrapIcon(({ size, style }: any) => <svg {...data.attrs} style={style} width={size} height={size} viewBox={data.viewBox} aria-hidden="true">{data.nodes.map(node)}</svg>,
    presetSize(data.attrs));
}

export function createCustomStore(api: any, registerIcons: (icons: Record<string, any>) => void) {
  let entries: CustomIcon[] = [];
  let pending: Promise<void> | undefined;
  const listeners = new Set<() => void>();
  const store = {
    get: () => entries,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async refresh() {
      if (!api) return;
      // Plugin load also runs on the sign-in page; avoid background 401 notices.
      if (api.auth?.getToken && !api.auth.getToken()) return;
      if (pending) return pending;
      pending = (async () => {
        const response = await api.request({ url: 'iconLibrary:list' });
        const data = response?.data?.data;
        if (!Array.isArray(data)) throw new Error('Invalid custom icon response');
        entries = data.map((entry) => ({ ...entry, definition: validateDefinition(entry.definition) }));
        registerIcons(Object.fromEntries(entries.map((entry) => [entry.name, customComponent(entry.definition)])));
        listeners.forEach((listener) => listener());
      })();
      try { await pending; } finally { pending = undefined; }
    },
    async import(label: string, keywords: string, source: string) {
      return store.importDefinition(label, keywords, parseSvg(source));
    },
    async importDefinition(label: string, keywords: string, value: SvgDefinition) {
      if (!api) throw new Error('Custom icon API unavailable');
      if (!label.trim() || label.length > 100) throw new Error('Icon label is required');
      const definition = validateDefinition(value);
      const uuid = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
      const response = await api.request({ url: 'iconLibrary:import', method: 'post', data: { name: `XzCustom${uuid}Outlined`, label, keywords, definition } });
      // A list started before the import may return a stale snapshot.
      if (pending) await pending.catch(() => {});
      await store.refresh();
      return response?.data?.data as CustomIcon;
    },
  };
  return store;
}
export type CustomStore = ReturnType<typeof createCustomStore>;
