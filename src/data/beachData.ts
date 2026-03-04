// ============================================
// Resort Beach Data (local JSON)
// 世界のリゾートビーチデータ
// ============================================

import type { BeachPin, BeachesJson } from '../types';
import type { AppLocale } from '../i18n/locale';

import beachesJson from './beaches.json';

const data = beachesJson as BeachesJson;

/** 地域 ID → 表示名（国の上レイヤー） */
export const REGION_IDS = ['asia', 'europe', 'americas', 'oceania', 'africa', 'caribbean', 'hawaii'] as const;
export type RegionId = (typeof REGION_IDS)[number];

export const REGION_NAMES: Record<RegionId, string> = {
  asia: 'アジア',
  europe: 'ヨーロッパ',
  americas: '北米・中南米',
  oceania: 'オセアニア',
  africa: 'アフリカ',
  caribbean: 'カリブ海',
  hawaii: 'ハワイ諸島',
};

export const REGION_NAMES_EN: Record<RegionId, string> = {
  asia: 'Asia',
  europe: 'Europe',
  americas: 'Americas',
  oceania: 'Oceania',
  africa: 'Africa',
  caribbean: 'Caribbean',
  hawaii: 'Hawaii',
};

/** 地域 → 国コードのリスト */
export const REGION_COUNTRIES: Record<RegionId, string[]> = {
  asia: ['JP', 'TH', 'SG', 'HK', 'AE', 'ID', 'IN', 'MV', 'PH'],
  europe: ['FR', 'GB', 'IT', 'ES', 'AT', 'DE', 'NL', 'CH', 'GR', 'PT'],
  americas: ['US', 'MX', 'BR', 'VE'],
  oceania: ['AU', 'PF'],
  africa: ['ZA', 'SC'],
  caribbean: ['PR', 'AW', 'BB'],
  hawaii: ['US'], // ハワイはUSだが、地域として分ける
};

/**
 * 地域の表示名（locale 省略時は日本語）
 */
export function getRegionDisplayName(regionId: RegionId, locale: AppLocale = 'ja'): string {
  const names = locale === 'en' ? REGION_NAMES_EN : REGION_NAMES;
  return names[regionId] ?? regionId;
}

/**
 * 国が属する地域（最初に一致したもの）
 */
export function getRegionForCountry(countryCode: string): RegionId | null {
  for (const [region, codes] of Object.entries(REGION_COUNTRIES)) {
    if (codes.includes(countryCode)) return region as RegionId;
  }
  return null;
}

/** 国コード → 表示名 */
export const COUNTRY_NAMES: Record<string, string> = {
  JP: '日本',
  US: 'アメリカ',
  FR: 'フランス',
  GB: 'イギリス',
  AE: 'UAE',
  SG: 'シンガポール',
  HK: '香港',
  IT: 'イタリア',
  ES: 'スペイン',
  AT: 'オーストリア',
  DE: 'ドイツ',
  NL: 'オランダ',
  CH: 'スイス',
  TH: 'タイ',
  AU: 'オーストラリア',
  ZA: '南アフリカ',
  IN: 'インド',
  ID: 'インドネシア',
  PR: 'プエルトリコ',
  AW: 'アラバ',
  BB: 'バルバドス',
  MX: 'メキシコ',
  BR: 'ブラジル',
  VE: 'ベネズエラ',
  GR: 'ギリシャ',
  PT: 'ポルトガル',
  MV: 'モルディブ',
  PF: 'フランス領ポリネシア',
  PH: 'フィリピン',
  SC: 'セーシェル',
};

export const COUNTRY_NAMES_EN: Record<string, string> = {
  JP: 'Japan',
  US: 'United States',
  FR: 'France',
  GB: 'United Kingdom',
  AE: 'UAE',
  SG: 'Singapore',
  HK: 'Hong Kong',
  IT: 'Italy',
  ES: 'Spain',
  AT: 'Austria',
  DE: 'Germany',
  NL: 'Netherlands',
  CH: 'Switzerland',
  TH: 'Thailand',
  AU: 'Australia',
  ZA: 'South Africa',
  IN: 'India',
  ID: 'Indonesia',
  PR: 'Puerto Rico',
  AW: 'Aruba',
  BB: 'Barbados',
  MX: 'Mexico',
  BR: 'Brazil',
  VE: 'Venezuela',
  GR: 'Greece',
  PT: 'Portugal',
  MV: 'Maldives',
  PF: 'French Polynesia',
  PH: 'Philippines',
  SC: 'Seychelles',
};

/** 日本の cityName → 都道府県 */
const CITY_TO_PREFECTURE: Record<string, string> = {
  沖縄: '沖縄県',
  石垣島: '沖縄県',
};

/**
 * ホテルの都道府県（日本のみ。それ以外は空文字）
 */
export function getPrefectureForBeach(beach: BeachPin): string {
  if (beach.countryCode !== 'JP') return '';
  return CITY_TO_PREFECTURE[beach.cityName] ?? '';
}

/** 国コード:cityName → 州・地域（都道府県と同じ粒度の表示名） */
const ADMIN_REGION_BY_COUNTRY_CITY: Record<string, string> = {
  // US (Hawaii)
  'US:ハワイ': 'ハワイ州',
  'US:ホノルル': 'ハワイ州',
  // TH
  'TH:プーケット': 'プーケット',
  'TH:ピピ島': 'ピピ島',
  // ID
  'ID:バリ': 'バリ',
  // AU
  'AU:シドニー': 'ニューサウスウェールズ',
  'AU:ウィッツンデー諸島': 'クイーンズランド',
  // FR
  'FR:ニース': 'プロヴァンス=アルプ=コート・ダジュール',
  // GR
  'GR:サントリーニ': 'サントリーニ',
  // PT
  'PT:カスカイス': 'リスボン',
  // MX
  'MX:プラヤ・デル・カルメン': 'キンタナ・ロー',
  'MX:トゥルム': 'キンタナ・ロー',
  // BR
  'BR:リオデジャネイロ': 'リオデジャネイロ',
  // ZA
  'ZA:ケープタウン': '西ケープ',
  // AE
  'AE:ドバイ': 'ドバイ',
  // PR
  'PR:クレブラ島': 'クレブラ',
  // AW
  'AW:オラニエスタッド': 'アラバ',
  // BB
  'BB:セントフィリップ': 'セントフィリップ',
  // VE
  'VE:マルガリータ島': 'ヌエバ・エスパルタ',
  // MV
  'MV:マレ': 'モルディブ',
  // PF
  'PF:ボラボラ': 'ソシエテ諸島',
  // PH
  'PH:ボラカイ': 'パラワン州',
  // SC
  'SC:マヘ島': 'セーシェル',
};

/**
 * ビーチの州・地域（都道府県と同じ粒度。全国対応）
 * 日本は都道府県、他国は州・地域名を返す
 */
export function getAdminRegionForBeach(beach: BeachPin): string {
  if (beach.countryCode === 'JP') return getPrefectureForBeach(beach);
  return ADMIN_REGION_BY_COUNTRY_CITY[`${beach.countryCode}:${beach.cityName}`] ?? '';
}

/**
 * 国コードの表示名（locale 省略時は日本語）
 */
export function getCountryDisplayName(code: string, locale: AppLocale = 'ja'): string {
  const names = locale === 'en' ? COUNTRY_NAMES_EN : COUNTRY_NAMES;
  return names[code] ?? code;
}

/**
 * ローカル JSON からリゾートビーチ一覧を取得
 */
export function getBeachPins(): BeachPin[] {
  return data.beaches ?? [];
}

/**
 * メタ情報（取得日）
 */
export function getBeachesMeta(): {
  generatedAt: string;
} {
  return {
    generatedAt: data.generatedAt ?? '',
  };
}
