import { CloseOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useFormLayout } from '@formily/antd-v5';
import { connect, mapReadPretty } from '@formily/react';
import { Button, Collapse, Empty, Grid, Input, Modal, Radio, Select, Space, Tooltip, Typography, theme } from 'antd';
import React, { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useT } from './locale';
import { extendedIconNames } from './builtins';
import { CustomStore, customComponent } from './customIcons';
import { colorIcon, savedIconColor, snapshotIcon } from './iconColor';
import { SvgDefinition } from '../svg';
import { presetSize } from './iconSize';
import { LayerPopover } from './LayerPopover';
import { cleanIconLabel, inCategory, metadataKeywords, matches, normalize, pickerCategories, rawName } from './search';
import { Preferences, readPreferences, writePreferences } from './preferences';

export interface ExtendedIconPickerProps {
  value?: string; onChange?: (value: string | null) => void; onChangeComplete?: (value: string | null) => void;
  disabled?: boolean; suffix?: React.ReactNode; iconSize?: number; searchable?: boolean;
}
export interface PickerRuntime {
  Icon: React.ComponentType<any>; hasIcon: (name: string) => boolean; icons: Map<string, any>;
  appName?: string; useUser?: () => any; getUserId?: () => string | number | undefined; custom?: CustomStore;
}
const PAGE_SIZE = 120;
export function createIconPicker(runtime: PickerRuntime) {
  const { Icon, hasIcon, icons, custom } = runtime;
  function IconField(props: ExtendedIconPickerProps) {
    const { token } = theme.useToken();
    const screens = Grid.useBreakpoint();
    const t = useT();
    const user = runtime.useUser?.();
    const scope = `${runtime.appName || 'main'}:${runtime.getUserId?.() ?? user?.data?.data?.id ?? user?.data?.id ?? user?.id ?? 'guest'}`;
    const layout = useFormLayout();
    const { value, disabled, searchable = true, iconSize = token.fontSizeXL } = props;
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState('all');
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [limit, setLimit] = useState(PAGE_SIZE);
    const scroll = useRef<HTMLDivElement>(null);
    const [preferences, setPreferences] = useState<Preferences>(() => readPreferences(scope));
    const [draft, setDraft] = useState(value || '');
    const preview = draft;
    const sourceRef = useRef<HTMLSpanElement>(null);
    const [definition, setDefinition] = useState<SvgDefinition>();
    const [color, setColor] = useState<string>();
    const colorEdited = useRef(false);
    const savedColor = (name: string) => savedIconColor(custom?.get().find((entry) => entry.name.toLowerCase() === name.toLowerCase()));
    const [size, setSize] = useState<number>();
    const savedSize = (name: string) => {
      const attrs = custom?.get().find((entry) => entry.name.toLowerCase() === name.toLowerCase())?.definition.attrs;
      return presetSize(attrs);
    };
    const colorInput = useRef<HTMLInputElement | null>(null);
    const commitColorInput = useCallback((event: Event) => {
      colorEdited.current = true;
      setColor((event.target as HTMLInputElement).value);
    }, []);
    const attachColorInput = useCallback((element: HTMLInputElement | null) => {
      colorInput.current?.removeEventListener('change', commitColorInput);
      colorInput.current = element;
      // Native change signals completion; React onChange also runs on every input.
      element?.addEventListener('change', commitColorInput);
    }, [commitColorInput]);
    const [colorFeedback, setColorFeedback] = useState('');
    const [customEntries, setCustomEntries] = useState(custom?.get() || []);
    const [importOpen, setImportOpen] = useState(false);
    const [popupZIndex, setPopupZIndex] = useState(2000);
    const [label, setLabel] = useState('');
    const [keywords, setKeywords] = useState('');
    const [svg, setSvg] = useState('');
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState('');
    useEffect(() => {
      const refresh = () => setPreferences(readPreferences(scope));
      refresh();
      window.addEventListener('xz-icon-library:preferences', refresh);
      window.addEventListener('storage', refresh);
      return () => { window.removeEventListener('xz-icon-library:preferences', refresh); window.removeEventListener('storage', refresh); };
    }, [scope]);
    useEffect(() => custom?.subscribe(() => setCustomEntries([...custom.get()])), []);
    useEffect(() => { if (user && custom) void custom.refresh().catch(() => {}); }, [scope]);
    useEffect(() => { setLimit(PAGE_SIZE); if (scroll.current) scroll.current.scrollTop = 0; }, [category, deferredQuery]);
    useEffect(() => { if (!open) setDraft(value || ''); }, [value, open]);
    useEffect(() => { colorEdited.current = false; setColor(savedColor(draft)); setSize(savedSize(draft)); setColorFeedback(''); }, [draft, open]);
    // A delayed list response can hydrate the saved color, but must not overwrite edits.
    useEffect(() => { if (!colorEdited.current) setColor(savedColor(draft)); }, [customEntries]);
    useLayoutEffect(() => {
      if (colorInput.current) colorInput.current.value = color || '#000000';
    }, [color, draft, open]);
    useLayoutEffect(() => {
      const svg = sourceRef.current?.querySelector('svg');
      const stored = custom?.get().find((entry) => entry.name.toLowerCase() === draft.toLowerCase());
      try { setDefinition(stored?.definition || (svg ? snapshotIcon(svg) : undefined)); } catch { setDefinition(undefined); }
    }, [draft, open, customEntries]);
    const originalColor = savedColor(draft);
    const ColoredIcon = useMemo(() => color && color !== originalColor && definition ? customComponent(colorIcon(definition, color)) : undefined, [color, originalColor, definition]);
    const names = useMemo(() => {
      const canonical = new Map(extendedIconNames.concat(customEntries.map((entry) => entry.name)).map((name) => [name.toLowerCase(), name]));
      // The native map also contains Ant Design helper exports, which are not glyphs.
      return [...icons.keys()].filter((name) => /(outlined|filled|twotone)$/i.test(name))
        .map((name) => canonical.get(name.toLowerCase()) || name);
    }, [customEntries, open]);
    const metadata = useMemo(() => new Map(customEntries.map((entry) => [entry.name.toLowerCase(), entry])), [customEntries]);
    const items = useMemo(() => {
      const source = category === 'recent' ? preferences.recent : category === 'favorites' ? preferences.favorites : names;
      return source.filter((name) => {
        const extra = metadata.get(name.toLowerCase());
        return hasIcon(name) && (['recent', 'favorites'].includes(category) || inCategory(name, category))
          && matches(name, deferredQuery, `${extra?.label || ''} ${metadataKeywords(name, extra)}`);
      }).sort((a, b) => {
        if (!deferredQuery) return 0;
        const exact = (name: string) => normalize(name) === normalize(deferredQuery) || normalize(rawName(name)) === normalize(deferredQuery) ? 1 : 0;
        return exact(b) - exact(a);
      });
    }, [category, deferredQuery, names, preferences, metadata]);
    const save = (next: Preferences) => { setPreferences(next); writePreferences(scope, next); };
    const choose = (name: string | null) => {
      if (disabled) return;
      if (name) save({ ...preferences, recent: [name, ...preferences.recent.filter((item) => item !== name)].slice(0, 30) });
      props.onChange?.(name); props.onChangeComplete?.(name); setOpen(false);
    };
    const favorite = (name: string) => save({ ...preferences, favorites: preferences.favorites.includes(name)
      ? preferences.favorites.filter((item) => item !== name) : [...preferences.favorites, name].slice(-100) });
    const cancel = () => { setOpen(false); setDraft(value || ''); setColor(savedColor(value || '')); setSize(savedSize(value || '')); setColorFeedback(''); };
    const appearanceChanged = color !== originalColor || size !== savedSize(draft);
    const apply = async () => {
      if (!draft || busy || disabled) return;
      if (!appearanceChanged) { choose(draft); return; }
      if (!custom || !definition) return;
      setBusy(true); setColorFeedback('');
      try {
        const selected = metadata.get(draft.toLowerCase());
        const recolor = color && color !== originalColor;
        const adjusted = recolor ? colorIcon(definition, color) : { ...definition, attrs: { ...definition.attrs } };
        if (size !== undefined) { adjusted.attrs.width = String(size); adjusted.attrs.height = String(size); }
        else { delete adjusted.attrs.width; delete adjusted.attrs.height; }
        const baseLabel = cleanIconLabel(selected?.label || rawName(draft));
        // Keep only the current color for compatibility with older saved variants.
        const suffix = color ? ` ${color}` : '';
        const imported = await custom.importDefinition(`${baseLabel.slice(0, 100 - suffix.length)}${suffix}`,
          metadataKeywords(draft, selected).slice(0, 255), adjusted);
        choose(imported.name);
      } catch (error) { setColorFeedback(t('Save appearance failed') + ': ' + (error as Error).message); }
      finally { setBusy(false); }
    };
    const extra = metadata.get(preview.toLowerCase());
    // Two-tone backgrounds must remain opaque and distinct from their outlines.
    const twoToneColor = [token.colorText, token.colorBgLayout];
    const previewGlyph = ColoredIcon ? <ColoredIcon size={40} style={{ fontSize: 40 }} /> : <Icon type={preview} size={40} style={{ fontSize: 40, color: token.colorText }} twoToneColor={twoToneColor} />;
    const inlineGlyph = ColoredIcon ? <ColoredIcon size={size ?? '1em'} /> : <Icon type={preview} size={size ?? '1em'} style={{ fontSize: size, color: token.colorText }} twoToneColor={twoToneColor} />;
    const details = <div style={{ minWidth: 0, minHeight: 0, height: screens.md ? '100%' : 360, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
      {preview && hasIcon(preview) ? <>
        <Space align="center" style={{ marginBottom: 12 }}>{previewGlyph}
          <Typography.Text strong aria-label={t('Preview icon')} style={{ overflowWrap: 'anywhere' }}>{cleanIconLabel(extra?.label || rawName(preview))}</Typography.Text></Space>
        <div>
          <Button size="small" aria-label={t('Favorite')} icon={preferences.favorites.includes(preview) ? <StarFilled /> : <StarOutlined />} onClick={() => favorite(preview)}>
            {t(preferences.favorites.includes(preview) ? 'Unfavorite' : 'Favorite')}</Button>
        </div>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8, marginBottom: 8, lineHeight: 1.6 }}>
          {[...new Set(metadataKeywords(preview, extra).split(/\s+/).filter(Boolean))].join(' · ')}
        </Typography.Paragraph>
        <div style={{ marginTop: 10 }}><Typography.Text type="secondary">{t('Icon color')}</Typography.Text>
          <Space wrap style={{ marginTop: 6, display: 'flex' }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 32, height: 28 }}>
              <input ref={attachColorInput} type="color" aria-label={t('Icon color')} disabled={busy || !definition || !custom} defaultValue={color || '#000000'}
                style={{ width: 32, height: 28, padding: 2, border: `1px solid ${token.colorBorder}`, borderRadius: 4, background: token.colorBgContainer }} />
              {!color && <span aria-hidden="true" data-color-empty style={{ position: 'absolute', inset: 3, background: token.colorBgContainer, pointerEvents: 'none', borderRadius: 2 }}>
                <svg width="100%" height="100%" viewBox="0 0 26 22"><line x1="1" y1="21" x2="25" y2="1" stroke={token.colorError} strokeWidth="2" /></svg>
              </span>}
            </span>
            <Typography.Text code>{color || t('Follow theme')}</Typography.Text>
            {color !== originalColor && <Button size="small" disabled={busy} onClick={() => {
              colorEdited.current = false; setColor(originalColor);
            }}>{t(originalColor ? 'Restore saved color' : 'Reset color')}</Button>}
          </Space>
          {colorFeedback && <Typography.Text type="danger" role="alert">{colorFeedback}</Typography.Text>}
        </div>
        <div style={{ marginTop: 10 }}>
          <Typography.Text type="secondary">{t('Icon size')}</Typography.Text>
          <Radio.Group aria-label={t('Icon size')} optionType="button" buttonStyle="solid" size="small"
            style={{ marginTop: 6, display: 'flex' }} value={size ?? 0} disabled={busy || !definition || !custom}
            onChange={(event) => setSize(event.target.value || undefined)} options={[
              { label: t('Small size'), value: 12 }, { label: t('Standard size'), value: 0 },
              { label: t('Large size'), value: 20 }, { label: t('Extra large size'), value: 24 },
            ]} />
        </div>
      </> : <Typography.Text type="secondary">{t('Click an icon to preview')}</Typography.Text>}
      </div>
      <Collapse size="small" ghost style={{ marginTop: 8, flexShrink: 0 }} items={[{ key: 'examples', label: t('Usage preview'), children:
        preview && hasIcon(preview) ? <Space direction="vertical"><Button icon={inlineGlyph}>{t('Button preview')}</Button>
          <span>{inlineGlyph} {t('Menu preview')}</span>
          <span>{inlineGlyph} {t('Tab preview')}</span></Space>
          : <Typography.Text type="secondary">{t('Click an icon to preview')}</Typography.Text> }]} />
    </div>;
    // Color updates affect the detail panel, not the 120+ icon grid.
    const iconGrid = useMemo(() => items.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(42px,1fr))', gap: 6 }}>
      {items.slice(0, limit).map((name) => <Tooltip key={name} title={cleanIconLabel(metadata.get(name.toLowerCase())?.label || rawName(name))}>
        <Button type="text" disabled={busy} aria-label={cleanIconLabel(metadata.get(name.toLowerCase())?.label || rawName(name))} aria-pressed={draft.toLowerCase() === name.toLowerCase()} style={{ height: 38,
          border: draft.toLowerCase() === name.toLowerCase() ? `1px solid ${token.colorPrimary}` : '1px solid transparent', color: token.colorText }}
          icon={<Icon type={name} size={iconSize} style={{ fontSize: iconSize, color: token.colorText }} twoToneColor={[token.colorText, token.colorBgLayout]} />}
          onClick={() => setDraft(name)} />
      </Tooltip>)}
    </div> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('No matching icons')} />,
    [items, limit, metadata, busy, draft, iconSize, token.colorPrimary, token.colorText, token.colorBgLayout, t]);
    const content = <div style={{ width: screens.md ? 720 : 400, maxWidth: 'calc(100vw - 48px)' }}>
      <div style={{ display: 'flex', gap: 16, flexDirection: screens.md ? 'row' : 'column', height: screens.md ? (searchable ? 448 : 406) : undefined }}>
      <div style={{ flex: screens.md ? '1 1 0' : '0 0 auto', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {searchable && <Input.Search allowClear value={query} placeholder={t('Search icons or Chinese keywords')}
        onChange={(event) => setQuery(event.target.value)} style={{ marginBottom: 10, flexShrink: 0 }} />}
      <Select aria-label={t('Category')} value={category} options={pickerCategories.map((item) => ({ label: t(item.label), value: item.key }))}
        onChange={setCategory} style={{ width: '100%', marginBottom: 10, flexShrink: 0 }} getPopupContainer={(trigger) => trigger.parentElement!} />
      <div ref={scroll} style={{ height: 320, flex: screens.md ? '1 1 0' : undefined, minHeight: 0, overflowY: 'auto', borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 8 }}
        onScroll={(event) => { const el = event.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) setLimit((old) => Math.min(items.length, old + PAGE_SIZE)); }}>
        {iconGrid}
      </div>
      <Space wrap style={{ marginTop: 10, width: '100%', justifyContent: 'space-between', flexShrink: 0 }}>
        <Typography.Text type="secondary">{Math.min(limit, items.length)} / {items.length} {t('icons')}</Typography.Text>
        {custom && <Button size="small" onClick={() => { setFeedback(''); setImportOpen(true); }}>{t('Import SVG')}</Button>}
      </Space>
      </div>
      {screens.md ? <aside aria-label={t('Icon details')} style={{ width: 224, height: '100%', minHeight: 0, flexShrink: 0, borderLeft: `1px solid ${token.colorBorderSecondary}`, paddingLeft: 16 }}>{details}</aside>
        : <Collapse size="small" items={[{ key: 'details', label: t('Icon details'), children: details }]} />}
      </div>
      <Space style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 10, marginTop: 10 }}>
        <Button disabled={busy} onClick={cancel}>{t('Cancel')}</Button>
        <Button type="primary" loading={busy} disabled={!draft || disabled || Boolean(appearanceChanged && (!custom || !definition))} onClick={() => void apply()}>{t('Apply')}</Button>
      </Space>
    </div>;
    return <><span ref={sourceRef} aria-hidden="true" style={{ display: 'none' }}><Icon type={draft} /></span><Space.Compact>
      <LayerPopover trigger="click" placement="bottom" open={open} content={content} onLayerChange={setPopupZIndex}
        onOpenChange={(next) => { if (disabled || busy || importOpen) return;
          if (!next) { cancel(); return; }
          setDraft(value || ''); setColor(savedColor(value || '')); setColorFeedback(''); setOpen(true);
          void custom?.refresh().catch(() => {});
        }}>
        <Button size={layout?.size as any} disabled={disabled} aria-label={t('Select icon')}>
          {hasIcon(value || '') ? <Icon type={value!} /> : t('Select icon')}</Button>
      </LayerPopover>
      {value && !disabled && <Button aria-label={t('Clear icon')} size={layout?.size as any} icon={<CloseOutlined />} onClick={() => choose(null)} />}
      {props.suffix}
    </Space.Compact>
    <Modal title={t('Import SVG')} open={importOpen} zIndex={Math.max(5000, popupZIndex + 1)} confirmLoading={busy} onCancel={() => setImportOpen(false)}
      okText={t('Import')} cancelText={t('Cancel')} onOk={async () => {
        setBusy(true); setFeedback('');
        try { const imported = await custom!.import(label, keywords, svg); setImportOpen(false); setLabel(''); setKeywords(''); setSvg(''); setQuery(''); setDraft(imported.name); setCategory('custom'); }
        catch (error) { setFeedback(t('Import failed') + ': ' + (error as Error).message); }
        finally { setBusy(false); }
      }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text>{t('SVG shapes only; imports require plugin permission')}</Typography.Text>
        <Input aria-label={t('Icon label')} placeholder={t('Icon label')} maxLength={100} value={label} onChange={(e) => setLabel(e.target.value)} />
        <Input aria-label={t('Keywords')} placeholder={t('Keywords')} maxLength={255} value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        <Input.TextArea aria-label="SVG" placeholder={'<svg viewBox="0 0 24 24">...</svg>'} rows={6} maxLength={50000} value={svg} onChange={(e) => setSvg(e.target.value)} />
        <input type="file" accept=".svg,image/svg+xml" aria-label={t('SVG file')} onChange={async (e) => {
          const file = e.target.files?.[0]; if (!file) return;
          if (file.size > 50000) { setFeedback(t('SVG file is too large')); return; }
          setSvg(await file.text()); if (!label) setLabel(file.name.replace(/\.svg$/i, ''));
        }} />
        {feedback && <Typography.Text type="danger" role="alert">{feedback}</Typography.Text>}
      </Space>
    </Modal></>;
  }
  return connect(IconField, mapReadPretty((props: { value?: string }) => props.value ? <Icon type={props.value} /> : <span />));
}
