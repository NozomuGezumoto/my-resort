// ============================================
// Beach Map Component
// 世界のリゾートビーチを世界地図に表示
// データはローカル JSON（getBeachPins）
// ============================================

import React, { useRef, useCallback, useMemo, useState, useEffect, memo } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import {
  SUSHI_COLORS,
  WORLD_INITIAL_REGION,
  PIN_SIZE,
  SPACING,
} from '../constants/theme';
import type { BeachPin } from '../types';
import {
  getBeachPins,
  getBeachesMeta,
  getAdminRegionForBeach,
  getCountryDisplayName,
  getBeachDisplayName,
  getBeachDisplayLocation,
  REGION_IDS,
  REGION_COUNTRIES,
  getRegionDisplayName,
  type RegionId,
} from '../data/beachData';
import BeachDetail from './BeachDetail';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n/I18nContext';

export type BeachStatusFilter = 'all' | 'visited' | 'wantToGo';
export type MoodFilter = 'all' | 'relax' | 'active' | 'romantic' | 'adventure' | 'nightlife' | 'family';

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5f6368' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e8eaed' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d7e8' }] },
];

const ListSeparator = memo(() => <View style={styles.listSeparator} />);

const BeachListItem = memo(function BeachListItem({
  beach,
  onPress,
  isVisited,
  isWantToGo,
  visitedDate,
  rating,
  t,
}: {
  beach: BeachPin;
  onPress: () => void;
  isVisited: boolean;
  isWantToGo: boolean;
  visitedDate?: string;
  rating?: number;
  t: (key: import('../i18n/translations').TranslationKeys, params?: { count?: number }) => string;
}) {
  const visitedYear = visitedDate ? new Date(visitedDate).getFullYear() : null;
  return (
    <Pressable style={styles.listItem} onPress={onPress}>
      <View style={styles.listItemIcon}>
        <Text style={styles.listItemIconEmoji}>🌴</Text>
      </View>
      <View style={styles.listItemInfo}>
        <View style={styles.listItemNameRow}>
          <Text style={styles.listItemName} numberOfLines={1}>{getBeachDisplayName(beach)}</Text>
          {isVisited && (
            <View style={styles.listItemBadgeVisited}>
              <Text style={styles.listItemBadgeText}>
                {t('visited')}{visitedYear && ` ${visitedYear}`}
              </Text>
            </View>
          )}
          {isWantToGo && (
            <View style={styles.listItemBadgeWantToGo}>
              <Text style={styles.listItemBadgeText}>{t('wantToGo')}</Text>
            </View>
          )}
        </View>
        <View style={styles.listItemMetaRow}>
          <Text style={styles.listItemMeta} numberOfLines={1}>
            {getBeachDisplayLocation(beach)}
          </Text>
          {rating !== undefined && (
            <View style={styles.listItemRating}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Ionicons
                  key={value}
                  name={value <= rating ? 'star' : 'star-outline'}
                  size={14}
                  color={value <= rating ? SUSHI_COLORS.accentTertiary : SUSHI_COLORS.textMuted}
                />
              ))}
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={SUSHI_COLORS.textMuted} />
    </Pressable>
  );
});

export default function BeachMap() {
  const { locale, t } = useI18n();
  const mapRef = useRef<MapView>(null);
  const detailSheetRef = useRef<BottomSheet>(null);
  const listSheetRef = useRef<BottomSheet>(null);
  const [selectedBeach, setSelectedBeach] = useState<BeachPin | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | ''>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<BeachStatusFilter>('all');
  const [selectedMood, setSelectedMood] = useState<MoodFilter>('all');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [statusExpanded, setStatusExpanded] = useState(false);
  const [moodExpanded, setMoodExpanded] = useState(false);
  const [yearExpanded, setYearExpanded] = useState(false);
  const [regionExpanded, setRegionExpanded] = useState(false);
  const [countryExpanded, setCountryExpanded] = useState(false);
  const [prefectureExpanded, setPrefectureExpanded] = useState(false);

  const visitedBeaches = useStore((s) => s.visitedBeaches);
  const visitedBeachDates = useStore((s) => s.visitedBeachDates);
  const wantToGoBeaches = useStore((s) => s.wantToGoBeaches);
  const beachRatings = useStore((s) => s.beachRatings);
  const getBeachesByYear = useStore((s) => s.getBeachesByYear);

  const beaches = useMemo(() => getBeachPins(), []);
  const meta = useMemo(() => getBeachesMeta(), []);

  const regionsWithData = useMemo(() => {
    const countrySet = new Set(beaches.map((b) => b.countryCode).filter(Boolean));
    return REGION_IDS.filter((rid) =>
      REGION_COUNTRIES[rid].some((c) => countrySet.has(c))
    );
  }, [beaches]);

  const countries = useMemo(() => {
    let codes = new Set(beaches.map((b) => b.countryCode).filter(Boolean));
    if (selectedRegion) {
      const inRegion = new Set(REGION_COUNTRIES[selectedRegion]);
      codes = new Set([...codes].filter((c) => inRegion.has(c)));
    }
    return Array.from(codes).sort((a, b) =>
      (getCountryDisplayName(a, locale) || a).localeCompare(getCountryDisplayName(b, locale) || b)
    );
  }, [beaches, selectedRegion, locale]);

  const adminRegions = useMemo(() => {
    const countryBeaches = beaches.filter((b) => b.countryCode === selectedCountry);
    const set = new Set<string>();
    countryBeaches.forEach((b) => {
      const region = getAdminRegionForBeach(b);
      if (region) set.add(region);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [beaches, selectedCountry]);

  // featuresから気分を抽出する関数
  const getBeachMoods = useCallback((beach: BeachPin): MoodFilter[] => {
    const moods: MoodFilter[] = [];
    const features = beach.features || [];
    const moodField = beach.mood || [];
    
    // moodフィールドがあればそれを使用
    if (moodField.length > 0) {
      moodField.forEach((m) => {
        if (m === 'リラックス' || m === 'relax') moods.push('relax');
        if (m === 'アクティブ' || m === 'active') moods.push('active');
        if (m === 'ロマンチック' || m === 'romantic') moods.push('romantic');
        if (m === 'アドベンチャー' || m === 'adventure') moods.push('adventure');
        if (m === 'ナイトライフ' || m === 'nightlife') moods.push('nightlife');
        if (m === '家族向け' || m === 'family') moods.push('family');
      });
    }
    
    // featuresから気分を推測
    if (features.includes('リラックス') || features.some(f => f.toLowerCase().includes('relax'))) {
      moods.push('relax');
    }
    if (features.includes('サーフィン') || features.includes('アクティビティ') || features.some(f => f.toLowerCase().includes('active'))) {
      moods.push('active');
    }
    if (features.includes('ナイトライフ') || features.some(f => f.toLowerCase().includes('night'))) {
      moods.push('nightlife');
    }
    if (features.includes('家族向け') || features.some(f => f.toLowerCase().includes('family'))) {
      moods.push('family');
    }
    if (features.includes('ハイキング') || features.includes('アドベンチャー') || features.some(f => f.toLowerCase().includes('adventure'))) {
      moods.push('adventure');
    }
    
    // デフォルトでリラックスを追加（明示的な気分がない場合）
    if (moods.length === 0) {
      moods.push('relax');
    }
    
    return Array.from(new Set(moods));
  }, []);

  const availableMoods = useMemo(() => {
    const moodSet = new Set<MoodFilter>();
    beaches.forEach((b) => {
      const moods = getBeachMoods(b);
      moods.forEach((m) => moodSet.add(m));
    });
    return Array.from(moodSet);
  }, [beaches, getBeachMoods]);

  const filteredBeaches = useMemo(() => {
    let list = beaches;
    if (selectedStatus === 'visited') {
      list = list.filter((b) => visitedBeaches.includes(b.id));
      // 年フィルターが選択されている場合
      if (selectedYear !== null) {
        const yearBeaches = getBeachesByYear(selectedYear);
        list = list.filter((b) => yearBeaches.includes(b.id));
      }
    } else if (selectedStatus === 'wantToGo') {
      list = list.filter((b) => wantToGoBeaches.includes(b.id));
    }
    if (selectedMood !== 'all') {
      list = list.filter((b) => {
        const moods = getBeachMoods(b);
        return moods.includes(selectedMood);
      });
    }
    if (selectedRegion) {
      const inRegion = new Set(REGION_COUNTRIES[selectedRegion]);
      list = list.filter((b) => inRegion.has(b.countryCode));
    }
    if (selectedCountry) {
      list = list.filter((b) => b.countryCode === selectedCountry);
    }
    if (selectedCountry && selectedPrefecture) {
      list = list.filter((b) => getAdminRegionForBeach(b) === selectedPrefecture);
    }
    // 評価でソート（評価があるものは上に、評価が高い順）
    list = [...list].sort((a, b) => {
      const ratingA = beachRatings[a.id];
      const ratingB = beachRatings[b.id];
      if (ratingA === undefined && ratingB === undefined) return 0;
      if (ratingA === undefined) return 1; // 評価なしは下に
      if (ratingB === undefined) return -1; // 評価なしは下に
      return ratingB - ratingA; // 評価が高い順
    });
    return list;
  }, [beaches, selectedStatus, selectedMood, selectedYear, selectedRegion, selectedCountry, selectedPrefecture, visitedBeaches, wantToGoBeaches, beachRatings, getBeachMoods, getBeachesByYear]);

  const totalCount = beaches.length;
  const regionCounts = useMemo(() => {
    const map: Record<string, number> = {};
    REGION_IDS.forEach((rid) => {
      const inRegion = new Set(REGION_COUNTRIES[rid]);
      map[rid] = beaches.filter((b) => inRegion.has(b.countryCode)).length;
    });
    return map;
  }, [beaches]);
  const countryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    beaches.forEach((b) => {
      if (b.countryCode) map[b.countryCode] = (map[b.countryCode] ?? 0) + 1;
    });
    return map;
  }, [beaches]);
  const adminRegionCounts = useMemo(() => {
    const map: Record<string, number> = {};
    beaches.filter((b) => b.countryCode === selectedCountry).forEach((b) => {
      const region = getAdminRegionForBeach(b);
      if (region) map[region] = (map[region] ?? 0) + 1;
    });
    return map;
  }, [beaches, selectedCountry]);

  const visitedCount = useMemo(
    () => beaches.filter((b) => visitedBeaches.includes(b.id)).length,
    [beaches, visitedBeaches]
  );
  const wantToGoCount = useMemo(
    () => beaches.filter((b) => wantToGoBeaches.includes(b.id)).length,
    [beaches, wantToGoBeaches]
  );

  // 訪問年リストを取得
  const visitedYears = useMemo(() => {
    const yearSet = new Set<number>();
    Object.values(visitedBeachDates).forEach((dateStr) => {
      if (dateStr) {
        const year = new Date(dateStr).getFullYear();
        yearSet.add(year);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a); // 新しい順
  }, [visitedBeachDates]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (selectedStatus === 'visited') {
      parts.push(t('visited'));
      if (selectedYear !== null) parts.push(`${selectedYear}${t('year')}`);
    }
    if (selectedStatus === 'wantToGo') parts.push(t('wantToGo'));
    if (selectedMood !== 'all') parts.push(t(`mood_${selectedMood}`));
    if (selectedPrefecture) parts.push(selectedPrefecture.replace(/(都|道|府|県|州)$/, ''));
    if (selectedCountry) parts.push(getCountryDisplayName(selectedCountry, locale));
    if (selectedRegion) parts.push(getRegionDisplayName(selectedRegion, locale));
    if (parts.length === 0) return `${t('all')} (${totalCount})`;
    return `${parts.join(' · ')} (${filteredBeaches.length})`;
  }, [t, locale, selectedStatus, selectedMood, selectedYear, selectedRegion, selectedCountry, selectedPrefecture, filteredBeaches.length, totalCount]);

  const detailSnapPoints = useMemo(() => ['55%', '85%'], []);
  const listSnapPoints = useMemo(() => ['12%', '50%', '85%'], []);

  const handleResetToCenter = useCallback(() => {
    mapRef.current?.animateToRegion(WORLD_INITIAL_REGION, 500);
  }, []);

  const handlePinPress = useCallback((beach: BeachPin) => {
    setSelectedBeach(beach);
    listSheetRef.current?.snapToIndex(0);
    detailSheetRef.current?.snapToIndex(0);
    mapRef.current?.animateToRegion({
      latitude: beach.lat,
      longitude: beach.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 500);
  }, []);

  const handleListItemPress = useCallback((beach: BeachPin) => {
    setSelectedBeach(beach);
    listSheetRef.current?.snapToIndex(0);
    detailSheetRef.current?.snapToIndex(0);
    mapRef.current?.animateToRegion({
      latitude: beach.lat,
      longitude: beach.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 500);
  }, []);

  const handleCloseDetail = useCallback(() => {
    detailSheetRef.current?.close();
    setSelectedBeach(null);
  }, []);

  const handleRegionChangeComplete = useCallback(() => {
    // ClusteredMapView が undefined で呼ぶとクラッシュするため必ず渡す
  }, []);

  // 行った/行きたいでフィルターしたとき、該当ピンがマップに収まるようにする
  useEffect(() => {
    if (
      (selectedStatus === 'visited' || selectedStatus === 'wantToGo') &&
      filteredBeaches.length > 0 &&
      mapRef.current
    ) {
      const coordinates = filteredBeaches.map((beach) => ({ latitude: beach.lat, longitude: beach.lng }));
      const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
      const padding = {
        top: screenHeight * 0.35,
        right: screenWidth * 0.3,
        bottom: screenHeight * 0.45,
        left: screenWidth * 0.3,
      };
      setTimeout(() => {
        mapRef.current?.fitToCoordinates?.(
          coordinates,
          { edgePadding: padding, animated: true }
        );
      }, 300);
    }
  }, [selectedStatus, filteredBeaches]);

  const renderListItem = useCallback(
    ({ item }: { item: BeachPin }) => (
      <BeachListItem
        beach={item}
        onPress={() => handleListItemPress(item)}
        isVisited={visitedBeaches.includes(item.id)}
        isWantToGo={wantToGoBeaches.includes(item.id)}
        visitedDate={visitedBeachDates[item.id]}
        rating={beachRatings[item.id]}
        t={t}
      />
    ),
    [handleListItemPress, visitedBeaches, wantToGoBeaches, visitedBeachDates, beachRatings, t]
  );

  const renderListHeader = useCallback(
    () => (
      <>
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>🏖️ {t('beachList')}</Text>
            <Text style={styles.listSubtitle}>
              {t('totalItems', { count: totalCount })}
              {(selectedRegion || selectedCountry || selectedPrefecture || selectedStatus !== 'all' || selectedMood !== 'all' || selectedYear !== null) && (
                <Text style={styles.listSubtitleFilter}> → {t('showingItems', { count: filteredBeaches.length })}</Text>
              )}
              {meta.generatedAt && ` · ${t('fetchedAt')}: ${meta.generatedAt.slice(0, 10)}`}
            </Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSummaryText}>{filterSummary}</Text>

          <Pressable style={styles.filterSectionRow} onPress={() => setStatusExpanded((e) => !e)}>
            <Text style={styles.filterLabel}>{t('filterStatus')}</Text>
            <Ionicons name={statusExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={SUSHI_COLORS.textMuted} />
          </Pressable>
          {statusExpanded && (
            <View style={styles.filterChipRow}>
              <Pressable
                style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipActive]}
                onPress={() => { setSelectedStatus('all'); setRegionExpanded(true); }}
              >
                <Text style={[styles.filterChipText, selectedStatus === 'all' && styles.filterChipTextActive]}>{t('all')}</Text>
              </Pressable>
              <Pressable
                style={[styles.filterChip, selectedStatus === 'visited' && styles.filterChipActive]}
                onPress={() => {
                  setSelectedStatus('visited');
                  setYearExpanded(true);
                  setRegionExpanded(true);
                }}
              >
                <Text style={[styles.filterChipText, selectedStatus === 'visited' && styles.filterChipTextActive]}>
                  {t('visited')} ({visitedCount})
                </Text>
              </Pressable>
              <Pressable
                style={[styles.filterChip, selectedStatus === 'wantToGo' && styles.filterChipActive]}
                onPress={() => { setSelectedStatus('wantToGo'); setRegionExpanded(true); }}
              >
                <Text style={[styles.filterChipText, selectedStatus === 'wantToGo' && styles.filterChipTextActive]}>
                  {t('wantToGo')} ({wantToGoCount})
                </Text>
              </Pressable>
            </View>
          )}

          {selectedStatus === 'visited' && visitedYears.length > 0 && (
            <>
              <Pressable style={styles.filterSectionRow} onPress={() => setYearExpanded((e) => !e)}>
                <Text style={styles.filterLabel}>{t('visitYear')}</Text>
                <Ionicons name={yearExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={SUSHI_COLORS.textMuted} />
              </Pressable>
              {yearExpanded && (
                <View style={styles.filterChipRow}>
                  <Pressable
                    style={[styles.filterChip, selectedYear === null && styles.filterChipActive]}
                    onPress={() => { setSelectedYear(null); }}
                  >
                    <Text style={[styles.filterChipText, selectedYear === null && styles.filterChipTextActive]}>{t('all')}</Text>
                  </Pressable>
                  {visitedYears.map((year) => (
                    <Pressable
                      key={year}
                      style={[styles.filterChip, selectedYear === year && styles.filterChipActive]}
                      onPress={() => { setSelectedYear(year); }}
                    >
                      <Text style={[styles.filterChipText, selectedYear === year && styles.filterChipTextActive]}>
                        {year}{t('year')} ({getBeachesByYear(year).length})
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}

          <Pressable style={styles.filterSectionRow} onPress={() => setMoodExpanded((e) => !e)}>
            <Text style={styles.filterLabel}>{t('filterMood')}</Text>
            <Ionicons name={moodExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={SUSHI_COLORS.textMuted} />
          </Pressable>
          {moodExpanded && (
            <View style={styles.filterChipRow}>
              <Pressable
                style={[styles.filterChip, selectedMood === 'all' && styles.filterChipActive]}
                onPress={() => { setSelectedMood('all'); }}
              >
                <Text style={[styles.filterChipText, selectedMood === 'all' && styles.filterChipTextActive]}>{t('all')}</Text>
              </Pressable>
              {availableMoods.map((mood) => {
                const moodKey = mood === 'all' ? 'all' : `mood_${mood}` as const;
                return (
                  <Pressable
                    key={mood}
                    style={[styles.filterChip, selectedMood === mood && styles.filterChipActive]}
                    onPress={() => { setSelectedMood(mood); }}
                  >
                    <Text style={[styles.filterChipText, selectedMood === mood && styles.filterChipTextActive]}>
                      {t(moodKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable style={styles.filterSectionRow} onPress={() => setRegionExpanded((e) => !e)}>
            <Text style={styles.filterLabel}>{t('filterRegion')}</Text>
            <Ionicons name={regionExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={SUSHI_COLORS.textMuted} />
          </Pressable>
          {regionExpanded && (
            <View style={styles.filterChipRow}>
              <Pressable
                style={[styles.filterChip, !selectedRegion && styles.filterChipActive]}
                onPress={() => { setSelectedRegion(''); setSelectedCountry(''); setSelectedPrefecture(''); setCountryExpanded(true); }}
              >
                <Text style={[styles.filterChipText, !selectedRegion && styles.filterChipTextActive]}>{t('all')}</Text>
              </Pressable>
              {regionsWithData.map((rid) => (
                <Pressable
                  key={rid}
                  style={[styles.filterChip, selectedRegion === rid && styles.filterChipActive]}
                  onPress={() => { setSelectedRegion(rid); setSelectedCountry(''); setSelectedPrefecture(''); setCountryExpanded(true); }}
                >
                  <Text style={[styles.filterChipText, selectedRegion === rid && styles.filterChipTextActive]}>
                    {getRegionDisplayName(rid, locale)} ({regionCounts[rid] != null ? regionCounts[rid] : 0})
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable style={styles.filterSectionRow} onPress={() => setCountryExpanded((e) => !e)}>
            <Text style={styles.filterLabel}>{t('filterCountry')}</Text>
            <Ionicons name={countryExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={SUSHI_COLORS.textMuted} />
          </Pressable>
          {countryExpanded && (
            <View style={styles.filterChipRow}>
              <Pressable
                style={[styles.filterChip, !selectedCountry && styles.filterChipActive]}
                onPress={() => { setSelectedCountry(''); setSelectedPrefecture(''); }}
              >
                <Text style={[styles.filterChipText, !selectedCountry && styles.filterChipTextActive]}>{t('all')}</Text>
              </Pressable>
              {countries.map((code) => (
                <Pressable
                  key={code}
                  style={[styles.filterChip, selectedCountry === code && styles.filterChipActive]}
                  onPress={() => {
                    setSelectedCountry(code);
                    setSelectedPrefecture('');
                    if (code === 'JP') setPrefectureExpanded(true);
                  }}
                >
                  <Text style={[styles.filterChipText, selectedCountry === code && styles.filterChipTextActive]}>
                    {getCountryDisplayName(code, locale)} ({countryCounts[code] != null ? countryCounts[code] : 0})
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {selectedCountry && adminRegions.length > 0 && (
            <>
              <Pressable style={styles.filterSectionRow} onPress={() => setPrefectureExpanded((e) => !e)}>
                <Text style={styles.filterLabel}>{selectedCountry === 'JP' ? t('filterPrefecture') : t('filterStateRegion')}</Text>
                <Ionicons name={prefectureExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={SUSHI_COLORS.textMuted} />
              </Pressable>
              {prefectureExpanded && (
                <View style={styles.filterChipRow}>
                  <Pressable
                    style={[styles.filterChip, !selectedPrefecture && styles.filterChipActive]}
                    onPress={() => setSelectedPrefecture('')}
                  >
                    <Text style={[styles.filterChipText, !selectedPrefecture && styles.filterChipTextActive]}>{t('all')}</Text>
                  </Pressable>
                  {adminRegions.map((region) => (
                    <Pressable
                      key={region}
                      style={[styles.filterChip, selectedPrefecture === region && styles.filterChipActive]}
                      onPress={() => { setSelectedPrefecture(region); }}
                    >
                      <Text style={[styles.filterChipText, selectedPrefecture === region && styles.filterChipTextActive]}>
                        {region.replace(/(都|道|府|県|州)$/, '')} ({adminRegionCounts[region] != null ? adminRegionCounts[region] : 0})}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </>
    ),
    [
      t,
      locale,
      totalCount,
      filteredBeaches.length,
      meta.generatedAt,
      filterSummary,
      statusExpanded,
      selectedStatus,
      visitedCount,
      wantToGoCount,
      yearExpanded,
      selectedYear,
      visitedYears,
      getBeachesByYear,
      moodExpanded,
      selectedMood,
      availableMoods,
      regionExpanded,
      selectedRegion,
      regionsWithData,
      regionCounts,
      countryExpanded,
      selectedCountry,
      countries,
      countryCounts,
      prefectureExpanded,
      selectedPrefecture,
      adminRegions,
      adminRegionCounts,
    ]
  );

  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;
    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        }}
        onPress={onPress}
        tracksViewChanges={false}
      >
        <View style={styles.clusterContainer}>
          <Text style={styles.clusterText}>{points > 99 ? '99+' : points}</Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionButtonsContainer}>
        <Pressable style={styles.actionButton} onPress={handleResetToCenter}>
          <Ionicons name="locate" size={22} color={SUSHI_COLORS.primary} />
        </Pressable>
      </View>

      <ClusteredMapView
        mapRef={(ref: MapView | null) => {
          mapRef.current = ref;
        }}
        style={styles.map}
        initialRegion={WORLD_INITIAL_REGION}
        customMapStyle={MAP_STYLE}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        clusterColor={SUSHI_COLORS.primary}
        clusterTextColor="#fff"
        radius={50}
        renderCluster={renderCluster}
        minPoints={2}
      >
        {filteredBeaches.map((beach) => {
          const visited = visitedBeaches.includes(beach.id);
          const wantToGo = wantToGoBeaches.includes(beach.id);
          const pinKind = visited ? 'visited' : wantToGo ? 'wantToGo' : 'default';
          return (
            <Marker
              key={`${beach.id}-${pinKind}-${visited}-${wantToGo}`}
              coordinate={{ latitude: beach.lat, longitude: beach.lng }}
              onPress={() => handlePinPress(beach)}
              tracksViewChanges={true}
            >
              <View
                style={[
                  styles.pinContainer,
                  pinKind === 'visited' && styles.beachPinVisited,
                  pinKind === 'wantToGo' && styles.beachPinWantToGo,
                  pinKind === 'default' && styles.beachPin,
                ]}
              >
                {pinKind === 'visited' ? (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                ) : pinKind === 'wantToGo' ? (
                  <Ionicons name="heart" size={24} color="#fff" />
                ) : (
                  <Text style={styles.pinEmoji}>🌴</Text>
                )}
              </View>
            </Marker>
          );
        })}
      </ClusteredMapView>

      <BottomSheet
        ref={listSheetRef}
        index={0}
        snapPoints={listSnapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
        animateOnMount={false}
        enableOverDrag={false}
      >
        {filteredBeaches.length > 0 ? (
          <BottomSheetFlatList
            data={filteredBeaches}
            keyExtractor={(item: BeachPin) => item.id}
            renderItem={renderListItem}
            ListHeaderComponent={renderListHeader}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={ListSeparator}
            initialNumToRender={12}
          />
        ) : (
          <BottomSheetScrollView contentContainerStyle={styles.listContent}>
            {renderListHeader()}
            <View style={styles.listEmpty}>
              <Text style={styles.listEmptyIcon}>🏖️</Text>
              <Text style={styles.listEmptyText}>{t('noData')}</Text>
              <Text style={styles.listEmptyHint}>{t('noDataHint')}</Text>
            </View>
          </BottomSheetScrollView>
        )}
      </BottomSheet>

      <BottomSheet
        ref={detailSheetRef}
        index={-1}
        snapPoints={detailSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
        animateOnMount={false}
      >
        <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {selectedBeach && (
            <BeachDetail beach={selectedBeach} onClose={handleCloseDetail} />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SUSHI_COLORS.background,
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    zIndex: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: PIN_SIZE.marker / 2,
    backgroundColor: SUSHI_COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  pinContainer: {
    width: PIN_SIZE.marker,
    height: PIN_SIZE.marker,
    borderRadius: PIN_SIZE.marker / 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  beachPin: {
    backgroundColor: SUSHI_COLORS.primary,
    borderColor: SUSHI_COLORS.primaryDark,
  },
  beachPinVisited: {
    backgroundColor: SUSHI_COLORS.accentSecondary,
    borderColor: '#248f6a',
  },
  beachPinWantToGo: {
    backgroundColor: SUSHI_COLORS.accent,
    borderColor: '#d14a62',
  },
  clusterContainer: {
    width: PIN_SIZE.cluster,
    height: PIN_SIZE.cluster,
    borderRadius: PIN_SIZE.cluster / 2,
    backgroundColor: SUSHI_COLORS.primary,
    borderWidth: 3,
    borderColor: SUSHI_COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  clusterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  sheetBackground: {
    backgroundColor: SUSHI_COLORS.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetIndicator: {
    backgroundColor: SUSHI_COLORS.textMuted,
    width: 48,
    height: 5,
  },
  listHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  filterSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: SUSHI_COLORS.border,
  },
  filterSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.xs,
  },
  filterSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: SUSHI_COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  filterSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.xs,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: SUSHI_COLORS.textMuted,
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    backgroundColor: SUSHI_COLORS.surface,
    borderWidth: 1,
    borderColor: SUSHI_COLORS.border,
  },
  filterChipActive: {
    backgroundColor: SUSHI_COLORS.primary,
    borderColor: SUSHI_COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: SUSHI_COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SUSHI_COLORS.textPrimary,
  },
  listSubtitle: {
    fontSize: 13,
    color: SUSHI_COLORS.textMuted,
    marginTop: 2,
  },
  listSubtitleFilter: {
    color: SUSHI_COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SUSHI_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemIconEmoji: {
    fontSize: 22,
  },
  pinEmoji: {
    fontSize: 24,
  },
  listItemInfo: {
    flex: 1,
    minWidth: 0,
  },
  listItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  listItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: SUSHI_COLORS.textPrimary,
    flex: 1,
    minWidth: 0,
  },
  listItemBadgeVisited: {
    backgroundColor: SUSHI_COLORS.accentSecondary + '25',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  listItemBadgeWantToGo: {
    backgroundColor: SUSHI_COLORS.primary + '25',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  listItemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: SUSHI_COLORS.textSecondary,
  },
  listItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    gap: SPACING.sm,
  },
  listItemMeta: {
    fontSize: 12,
    color: SUSHI_COLORS.textMuted,
    flex: 1,
  },
  listItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  listSeparator: {
    height: 1,
    backgroundColor: SUSHI_COLORS.border,
    marginLeft: SPACING.lg + 40 + SPACING.md,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  listEmptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  listEmptyText: {
    fontSize: 16,
    color: SUSHI_COLORS.textMuted,
    textAlign: 'center',
  },
  listEmptyHint: {
    fontSize: 13,
    color: SUSHI_COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
});
