import zh from '../locale/zh-CN.json';
import en from '../locale/en-US.json';
import { useTranslation } from 'react-i18next';
export const localeResources = { 'zh-CN': zh, 'en-US': en };
export const useT = () => useTranslation('@xiezuo/plugin-icon-library').t;
