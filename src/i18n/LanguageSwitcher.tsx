import { GlobalOutlined } from '@ant-design/icons';
import { Select, Space } from 'antd';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '.';
import useSwitchLanguage from './useSwitchLanguage';

const { Option } = Select;

interface LanguageSwitcherProps {
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  showIcon?: boolean;
  showLabel?: boolean;
}

/**
 * 语言切换器组件
 * 支持在所有微前端应用间同步语言切换
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  style,
  size = 'middle',
  showIcon = true,
  showLabel = false,
}) => {
  const { t, i18n } = useTranslation();
  const { switchAllLanguages } = useSwitchLanguage();

  const handleLanguageChange = (languageCode: string) => {
    switchAllLanguages(languageCode);
  };

  return (
    <Space style={style}>
      {showIcon && <GlobalOutlined />}
      {showLabel && <span>{t('language.select')}</span>}
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        size={size}
        style={{ minWidth: 120 }}
        placeholder={t('language.select')}
      >
        {supportedLanguages.map((lang) => (
          <Option key={lang.code} value={lang.code}>
            {lang.name}
          </Option>
        ))}
      </Select>
    </Space>
  );
};

export default LanguageSwitcher;
