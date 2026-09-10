import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { useFormLayout } from '@formily/antd-v5';
import { connect, mapProps, mapReadPretty } from '@formily/react';
import { isValid } from '@formily/shared';
import { Button, Empty, Input, Popover, Select, Space, Tooltip, theme, Typography } from 'antd';
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Icon, hasIcon, icons } from '@nocobase/client';
import { categories, searchableLabels } from './catalog';
import { extendedIconNames } from './icons';

export interface ExtendedIconPickerProps {
  value?: string;
  onChange?: (value: string | null) => void;
  disabled?: boolean;
  suffix?: React.ReactNode;
  iconSize?: number;
  searchable?: boolean;
}

/** 一次渲染多少图标，滚动到底部再继续加载，避免上千个图标一次性渲染卡顿 */
const PAGE_SIZE = 240;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
const rawName = (value: string) => value.replace(/^Xz/, '').replace(/(Outlined|Filled|TwoTone)$/i, '');

/** 中文关键词索引：图标名归一化后 -> 中文关键词，扩展图标与系统图标都能命中 */
const labelIndex = Object.entries(searchableLabels).reduce<Record<string, string>>((acc, [name, label]) => {
  acc[normalize(name)] = normalize(label);
  return acc;
}, {});
const labelKeys = Object.keys(labelIndex).sort((a, b) => b.length - a.length);

/** 精确命中优先，其次按前缀命中（例如 useradd -> user、filetext -> file） */
const labelOf = (plain: string) => {
  const key = normalize(plain);
  if (labelIndex[key]) {
    return labelIndex[key];
  }
  const hit = labelKeys.find((item) => item.length >= 3 && key.startsWith(item));
  return hit ? labelIndex[hit] : '';
};

const matchIcon = (name: string, rule: RegExp, needle: string) => {
  const plain = rawName(name);
  if (!rule.test(plain)) {
    return false;
  }
  if (!needle) {
    return true;
  }
  const searchText = `${normalize(plain)} ${labelOf(plain)}`;
  return searchText.includes(needle);
};

function IconField(props: ExtendedIconPickerProps) {
  const { fontSizeXL, colorPrimary, colorBorderSecondary } = theme.useToken().token;
  const layout = useFormLayout();
  const { value, onChange, disabled, searchable = true, iconSize = fontSizeXL } = props;
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);

  const items = useMemo(() => {
    const rule = categories.find((item) => item.key === category)?.keywords || /.*/;
    const needle = normalize(deferredQuery);
    const systemSuffix = category === 'systemOutlined' ? 'outlined' : category === 'systemFilled' ? 'filled' : 'twotone';
    const candidates = category.startsWith('system')
      ? [...icons.keys()].filter((name) => !name.startsWith('xz') && name.endsWith(systemSuffix))
      : extendedIconNames;
    return candidates.filter((name) => matchIcon(name, rule, needle));
  }, [category, deferredQuery]);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [category, deferredQuery]);

  const visibleItems = items.slice(0, limit);
  const isSystemCategory = category.startsWith('system');
  const searchSystemIcons = () => {
    setCategory('systemOutlined');
    setLimit(PAGE_SIZE);
  };

  const content = (
    <div style={{ width: 560, maxWidth: 'calc(100vw - 48px)' }}>
      {searchable && (
        <Input.Search
          allowClear
          value={query}
          placeholder="搜索图标名称或中文关键词"
          onChange={(event) => setQuery(event.target.value)}
          style={{ marginBottom: 12 }}
        />
      )}
      <Select
        value={category}
        options={categories.map((item) => ({ label: item.label, value: item.key }))}
        onChange={(next) => setCategory(next)}
        style={{ width: '100%', marginBottom: 12 }}
      />
      <div
        style={{ maxHeight: 320, overflowY: 'auto', borderTop: `1px solid ${colorBorderSecondary}`, paddingTop: 10 }}
        onScroll={(event) => {
          const el = event.currentTarget;
          if (limit < items.length && el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
            setLimit(limit + PAGE_SIZE);
          }
        }}
      >
        {items.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: 6 }}>
            {visibleItems.map((name) => (
              <Tooltip key={name} title={rawName(name)} mouseEnterDelay={0.5}>
                <Button
                  type={value?.toLowerCase() === name.toLowerCase() ? 'primary' : 'text'}
                  aria-label={rawName(name)}
                  style={{ height: 38, color: value?.toLowerCase() === name.toLowerCase() ? undefined : colorPrimary }}
                  icon={<Icon type={name} style={{ fontSize: iconSize }} />}
                  onClick={() => { onChange?.(name); setOpen(false); }}
                />
              </Tooltip>
            ))}
          </div>
        ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的图标" />}
      </div>
      <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
        {items.length > limit
          ? `已显示 ${visibleItems.length} / ${items.length} 个，滚动加载更多或搜索缩小范围`
          : `共 ${items.length} 个图标`}
        {isSystemCategory ? ' · 系统图标' : null}
        {!isSystemCategory && query ? (
          <>
            {' · '}
            <Typography.Link onClick={searchSystemIcons}>在系统图标中搜索</Typography.Link>
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <Space.Compact>
      <Popover trigger="click" placement="bottom" open={open} onOpenChange={(next) => !disabled && setOpen(next)} content={content}>
        <Button size={layout.size as any} disabled={disabled}>
          {hasIcon(value || '') ? <Icon type={value!} /> : '选择扩展图标'}
        </Button>
      </Popover>
      {value && !disabled && <Button size={layout.size as any} icon={<CloseOutlined />} onClick={() => onChange?.(null)} />}
    </Space.Compact>
  );
}

export const ExtendedIconPicker = connect(
  IconField,
  mapProps((props: ExtendedIconPickerProps, field) => ({
    ...props,
    suffix: <span>{field?.['loading'] || field?.['validating'] ? <LoadingOutlined /> : props.suffix}</span>,
  })),
  mapReadPretty((props: { value?: string }) => isValid(props.value) ? <Icon type={props.value!} /> : <div />),
);
