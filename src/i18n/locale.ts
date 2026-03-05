// English only. Force locale to 'en'.
export type AppLocale = 'en';

/** サポートする言語（現在は英語のみ） */
export const SUPPORTED_LOCALES: readonly AppLocale[] = ['en'];

/** フォールバック */
export const FALLBACK_LOCALE: AppLocale = 'en';

export function getDeviceLocale(): AppLocale {
  return 'en';
}
