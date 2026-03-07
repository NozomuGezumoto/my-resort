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
  americas: '北米\u30fb中南米',
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
  oceania: ['AU', 'PF', 'FJ'],
  africa: ['ZA', 'SC', 'TZ'],
  caribbean: ['PR', 'AW', 'BB', 'DO'],
  hawaii: ['US'], // ハワイはUSだが、地域として分ける
};

/**
 * 地域の表示名（現在は英語のみ）
 */
export function getRegionDisplayName(regionId: RegionId, _locale?: AppLocale): string {
  return REGION_NAMES_EN[regionId] ?? regionId;
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
  DO: 'ドミニカ共和国',
  FJ: 'フィジー',
  TZ: 'タンザニア',
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
  DO: 'Dominican Republic',
  FJ: 'Fiji',
  TZ: 'Tanzania',
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
  'FR:ニース': 'プロヴァンス=アルプ=コート\u30fbダジュール',
  // GR
  'GR:サントリーニ': 'サントリーニ',
  'GR:ミコノス': 'ミコノス',
  // PT
  'PT:カスカイス': 'リスボン',
  'ES:イビサ': 'バレアレス諸島',
  'IT:アマルフィ': 'カンパニア',
  'IN:ゴア': 'ゴア',
  'TZ:ザンジバル': 'ザンジバル',
  'FJ:ナディ': 'ビティレブ',
  'DO:プンタカナ': 'ラ\u30fbアルタグラシア',
  // MX
  'MX:プラヤ\u30fbデル\u30fbカルメン': 'キンタナ\u30fbロー',
  'MX:トゥルム': 'キンタナ・ロー',
  'MX:カンクン': 'キンタナ・ロー',
  'US:マイアミ': 'フロリダ',
  'US:マウイ': 'ハワイ州',
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
  'VE:マルガリータ島': 'ヌエバ\u30fbエスパルタ',
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
 * 国コードの表示名（現在は英語のみ）
 */
export function getCountryDisplayName(code: string, _locale?: AppLocale): string {
  return COUNTRY_NAMES_EN[code] ?? code;
}

/** 特徴タグの日本語→英語マップ（英語表示用） */
const FEATURE_EN: Record<string, string> = {
  白砂: 'White sand',
  '透明度の高い海': 'Crystal clear waters',
  シュノーケリング: 'Snorkeling',
  リラックス: 'Relax',
  ダイビング: 'Diving',
  文化: 'Culture',
  サーフィン: 'Surfing',
  ナイトライフ: 'Nightlife',
  リゾート: 'Resort',
  朝日: 'Sunrise',
  散歩: 'Walking',
  ピンクサンド: 'Pink sand',
  ウミガメ: 'Sea turtles',
  水上コテージ: 'Overwater bungalows',
  緑の砂: 'Green sand',
  ユニーク: 'Unique',
  ハイキング: 'Hiking',
  黒い砂: 'Black sand',
  赤い砂: 'Red sand',
  アクティビティ: 'Activities',
  ショッピング: 'Shopping',
  家族向け: 'Family-friendly',
  ラグーン: 'Lagoon',
  'オーバーウォーターコテージ': 'Overwater bungalows',
  自然: 'Nature',
  アクティブ: 'Active',
  ロマンチック: 'Romantic',
  カルチャー: 'Culture',
  アート: 'Art',
  ヨガ: 'Yoga',
  ゴルフ: 'Golf',
  'オールインクルーシブ': 'All-inclusive',
};

/** ベストシーズン簡易翻訳（日本語→英語） */
const BEST_SEASON_EN: Record<string, string> = {
  '通年': 'Year-round',
  '12月〜4月': 'Dec-Apr',
  '12月〜3月': 'Dec-Mar',
  '11月〜4月': 'Nov-Apr',
  '4月〜10月': 'Apr-Oct',
  '6月〜9月': 'Jun-Sep',
  '5月〜9月': 'May-Sep',
  '5月〜10月': 'May-Oct',
  '11月〜2月': 'Nov-Feb',
  '12月〜2月': 'Dec-Feb',
};

export function getBeachDisplayName(beach: BeachPin): string {
  return beach.nameEn || beach.name;
}

/** cityName (JA) -> English */
const CITY_NAME_EN: Record<string, string> = {
  ハワイ: 'Hawaii', ホノルル: 'Honolulu', マウイ: 'Maui', クレブラ島: 'Culebra Island',
  オラニエスタッド: 'Oranjestad', セントフィリップ: 'St. Philip', バリ: 'Bali',
  シンガポール: 'Singapore', プーケット: 'Phuket', ピピ島: 'Phi Phi Island',
  沖縄: 'Okinawa', 石垣島: 'Ishigaki Island', シドニー: 'Sydney',
  ウィッツンデー諸島: 'Whitsunday Islands', ニース: 'Nice', サントリーニ: 'Santorini',
  ミコノス: 'Mykonos', カスカイス: 'Cascais', イビサ: 'Ibiza',
  'プラヤ\u30fbデル\u30fbカルメン': 'Playa del Carmen', トゥルム: 'Tulum', カンクン: 'Cancún',
  リオデジャネイロ: 'Rio de Janeiro', ケープタウン: 'Cape Town', ドバイ: 'Dubai',
  マルガリータ島: 'Margarita Island', マレ: 'Malé', ボラボラ: 'Bora Bora',
  ボラカイ: 'Boracay', マヘ島: 'Mahé', プンタカナ: 'Punta Cana', ナディ: 'Nadi',
  マイアミ: 'Miami', ゴア: 'Goa', ザンジバル: 'Zanzibar', アマルフィ: 'Amalfi',
};

/** region (JA) -> English */
const REGION_JA_TO_EN: Record<string, string> = {
  アジア: 'Asia', ヨーロッパ: 'Europe', '北米\u30fb中南米': 'Americas',
  オセアニア: 'Oceania', アフリカ: 'Africa', カリブ海: 'Caribbean', ハワイ諸島: 'Hawaii',
};

export function getBeachDisplayLocation(beach: BeachPin): string {
  const city = beach.cityName ? (CITY_NAME_EN[beach.cityName] ?? beach.cityName) : '';
  const region = beach.region ? (REGION_JA_TO_EN[beach.region] ?? beach.region) : '';
  if (city && region) return `${city} · ${region}`;
  if (city) return city;
  if (region) return region;
  return beach.countryCode ? getCountryDisplayName(beach.countryCode) : '';
}

export function getBeachDisplayCityName(beach: BeachPin): string {
  return beach.cityName ? (CITY_NAME_EN[beach.cityName] ?? beach.cityName) : '';
}

export function getBeachDisplayDescription(beach: BeachPin): string {
  return beach.descriptionEn || beach.description || '';
}

export function getBeachDisplayFeatures(beach: BeachPin): string[] {
  if (beach.featuresEn?.length) return beach.featuresEn;
  return (beach.features || []).map((f) => FEATURE_EN[f] || f);
}

export function getBeachDisplayBestSeason(beach: BeachPin): string {
  if (beach.bestSeasonEn) return beach.bestSeasonEn;
  const ja = beach.bestSeason || '';
  return BEST_SEASON_EN[ja] || ja;
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
