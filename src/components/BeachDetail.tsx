// ============================================
// Beach Detail Component
// ビーチ詳細・行った・画像・思い出
// ============================================

import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Linking,
  Platform,
  TextInput,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SUSHI_COLORS, SPACING, RADIUS } from '../constants/theme';
import type { BeachPin } from '../types';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n/I18nContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;
const MAIN_PHOTO_HEIGHT = 160;
const SUB_PHOTO_SIZE = (PHOTO_WIDTH - SPACING.sm * 2) / 3;

// 国ごとの代表的な食べ物・飲み物（データになければこれを使う）
const DEFAULT_FOOD_BY_COUNTRY: Record<string, string[]> = {
  US: ['ポキ', 'ロコモコ', 'ガーリックシュリンプ'],
  PR: ['モフォンゴ', 'フリタス（揚げバナナ）'],
  AW: ['シーフード', 'ケシヤナ（チーズ詰め料理）'],
  BB: ['フライドフィッシュ', 'クー・クー'],
  ID: ['ナシゴレン', 'ミーゴレン', 'サテ'],
  TH: ['トムヤムクン', 'パッタイ', 'グリーンカレー'],
  SG: ['チキンライス', 'チリクラブ'],
  JP: ['沖縄そば', 'ラフテー', '海ぶどう'],
  AU: ['フィッシュ＆チップス', 'オージービーフステーキ'],
  FR: ['ブイヤベース', 'シーフードプラッター'],
  GR: ['ギロピタ', 'ギリシャサラダ'],
  PT: ['バカリャウ（干し鱈料理）', 'シーフードリゾット'],
  MX: ['タコス', 'セビーチェ'],
  BR: ['シュラスコ', 'ムケッカ'],
  ZA: ['シーフードプラッター', 'ボボティ'],
  AE: ['メゼ', 'グリルケバブ'],
  VE: ['アレパ', 'シーフード'],
  MV: ['シーフードグリル', 'マスフニ（ツナとココナッツの料理）'],
  PF: ['ポワソンクリュ（マリネされた魚）', 'ポリネシアンBBQ'],
  PH: ['フィリピン料理', 'レチョン'],
  SC: ['クレオール料理', 'グリルフィッシュ'],
};

const DEFAULT_DRINKS_BY_COUNTRY: Record<string, string[]> = {
  US: ['マイタイ', 'ピニャコラーダ', 'コナコーヒー'],
  PR: ['ピニャコラーダ', 'ラムカクテル'],
  AW: ['ラムパンチ', 'トロピカルカクテル'],
  BB: ['ラム', 'ラムパンチ'],
  ID: ['バリコーヒー', 'トロピカルジュース'],
  TH: ['シンハービール', 'タイアイスティー'],
  SG: ['シンガポールスリング', 'タイガービール'],
  JP: ['オリオンビール', '泡盛'],
  AU: ['オーストラリアワイン', 'クラフトビール'],
  FR: ['ロゼワイン', 'スパークリングワイン'],
  GR: ['ウーゾ', 'ギリシャワイン'],
  PT: ['ポルトワイン', 'ヴィーニョ・ヴェルデ'],
  MX: ['マルガリータ', 'テキーラ'],
  BR: ['カイピリーニャ', 'ブラジルビール'],
  ZA: ['南アフリカワイン', 'クラフトビール'],
  AE: ['モクテル', 'ミントレモネード'],
  VE: ['トロピカルジュース', 'ラムカクテル'],
  MV: ['ココナッツウォーター', 'トロピカルジュース'],
  PF: ['トロピカルカクテル', 'ココナッツウォーター'],
  PH: ['サンミゲルビール', 'トロピカルカクテル'],
  SC: ['セーシェルビール', 'ココナッツウォーター'],
};

const DEFAULT_UNIQUE_EXPERIENCE_BY_COUNTRY: Record<string, string> = {
  US: '虹とサンセットを眺めながら、ビーチ沿いをゆっくり散歩する体験。',
  PR: 'どこまでも続く白砂のビーチと、カリブ海の濃いブルーのコントラストを味わう時間。',
  AW: 'ウミガメの産卵地としても知られるビーチで、静かな夕暮れを過ごす体験。',
  BB: 'ピンクがかった砂浜とターコイズブルーの海を眺めながら、のんびり過ごす一日。',
  ID: 'ビーチから数分でスパやバリニーズマッサージに行ける、癒やし特化のリゾート体験。',
  TH: 'ビーチバーでライブ音楽を聞きながら、屋台料理とサンセットを楽しむ体験。',
  SG: '街からすぐのリゾートアイランドで、シティとビーチを一度に味わえる体験。',
  JP: 'エメラルドグリーンの海と星空を同時に楽しめる、南国ならではの夜のビーチ時間。',
  AU: '海沿いの遊歩道をサーファーと一緒に歩きながら、カフェでのんびり過ごす休日。',
  FR: '地中海の光と歴史ある街並みを背景に、ビーチとカフェ文化を行き来する体験。',
  GR: '真っ白な家並みとエーゲ海のブルーを一望しながら、崖の上からサンセットを眺める時間。',
  PT: 'リスボン近郊のビーチで、旧市街観光と海辺ステイをセットで楽しむ体験。',
  MX: 'マヤ遺跡のすぐそばで、遺跡とカリブ海のビーチを一度に味わえる特別なロケーション。',
  BR: 'コパカバーナのビーチプロムナードで、音楽とサッカーと海が混ざり合う空気を感じる体験。',
  ZA: 'テーブルマウンテンをバックに、ドラマチックなサンセットと大西洋の波を眺める時間。',
  AE: '近未来的な高層ビル群を背にしながら、ビーチサイドでラグジュアリーな時間を過ごす体験。',
  VE: '人の少ないビーチで、カリブの素朴な雰囲気とゆったりした時間を独り占めできる体験。',
  MV: '水上ヴィラから直接海へ飛び込んで、そのままシュノーケリングに出かけられる贅沢な時間。',
  PF: 'ラグーンの上のコテージから、ターコイズブルーの海を一日中眺めて過ごす体験。',
  PH: '真っ白な砂浜を裸足で歩きながら、ビーチバーとサンセットをはしごする夜。',
  SC: '巨岩と真っ白な砂浜が並ぶ、世界でも珍しい風景の中で過ごす静かなビーチ時間。',
};

interface BeachDetailProps {
  beach: BeachPin;
  onClose: () => void;
}

function BeachPhotoGallery({
  photos,
  onAddPhoto,
  onRemovePhoto,
  t,
}: {
  photos: string[];
  onAddPhoto: () => void;
  onRemovePhoto: (uri: string) => void;
  t: (key: import('../i18n/translations').TranslationKeys) => string;
}) {
  const mainPhoto = photos[0];
  const subPhotos = photos.slice(1, 4);
  const canAddMore = photos.length < 4;
  const hasPhotos = photos.length > 0;

  const handleTapPhoto = (uri: string) => {
    Alert.alert(
      t('deletePhoto'),
      t('deletePhotoConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => onRemovePhoto(uri) },
      ]
    );
  };

  return (
    <View style={styles.photoGallery}>
      <Pressable
        style={[styles.mainPhotoSlot, hasPhotos && styles.mainPhotoSlotFilled]}
        onPress={mainPhoto ? () => handleTapPhoto(mainPhoto) : onAddPhoto}
      >
        {mainPhoto ? (
          <Image source={{ uri: mainPhoto }} style={styles.mainPhoto} />
        ) : (
          <View style={styles.addPhotoPlaceholder}>
            <Text style={styles.addPhotoEmoji}>📸</Text>
            <Text style={styles.addPhotoTitle}>{t('addPhoto')}</Text>
            <Text style={styles.addPhotoSubtitle}>{t('addPhotoSubtitle')}</Text>
          </View>
        )}
      </Pressable>
      {hasPhotos && (
        <View style={styles.subPhotoRow}>
          {[0, 1, 2].map((index) => {
            const photo = subPhotos[index];
            const isAddButton = !photo && canAddMore && index === subPhotos.length;
            return (
              <Pressable
                key={index}
                style={[styles.subPhotoSlot, photo && styles.subPhotoSlotFilled]}
                onPress={photo ? () => handleTapPhoto(photo) : isAddButton ? onAddPhoto : undefined}
              >
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.subPhoto} />
                ) : isAddButton ? (
                  <View style={styles.addPhotoPlaceholderSmall}>
                    <Ionicons name="add" size={24} color={SUSHI_COLORS.primary} />
                  </View>
                ) : (
                  <View style={styles.emptyPhotoSlot} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function BeachDetail({ beach, onClose }: BeachDetailProps) {
  const { t } = useI18n();
  const visited = useStore((s) => s.visitedBeaches.includes(beach.id));
  const wantToGo = useStore((s) => s.wantToGoBeaches.includes(beach.id));
  const visitedDate = useStore((s) => s.getBeachVisitedDate(beach.id));
  const markBeachVisited = useStore((s) => s.markBeachVisited);
  const unmarkBeachVisited = useStore((s) => s.unmarkBeachVisited);
  const markBeachWantToGo = useStore((s) => s.markBeachWantToGo);
  const unmarkBeachWantToGo = useStore((s) => s.unmarkBeachWantToGo);
  const setBeachMemo = useStore((s) => s.setBeachMemo);
  const addBeachPhoto = useStore((s) => s.addBeachPhoto);
  const removeBeachPhoto = useStore((s) => s.removeBeachPhoto);
  const setBeachRating = useStore((s) => s.setBeachRating);

  // 食べ物・飲み物は「個別データ > 国ごとのデフォルト」の順で採用する
  const defaultFood = DEFAULT_FOOD_BY_COUNTRY[beach.countryCode] ?? [];
  const defaultDrinks = DEFAULT_DRINKS_BY_COUNTRY[beach.countryCode] ?? [];
  const foodList = beach.food && beach.food.length > 0 ? beach.food : defaultFood;
  const drinksList = beach.drinks && beach.drinks.length > 0 ? beach.drinks : defaultDrinks;
  const hasFood = foodList.length > 0;
  const hasDrinks = drinksList.length > 0;
  const defaultUniqueExperience = DEFAULT_UNIQUE_EXPERIENCE_BY_COUNTRY[beach.countryCode];
  const uniqueExperience = beach.uniqueExperience || defaultUniqueExperience;
  const hasUniqueExperience = !!uniqueExperience;

  const storeMemoNote = useStore((s) => s.beachMemos.find((m) => m.id === beach.id)?.note ?? '');
  const photos = useStore((s) => s.beachMemos.find((m) => m.id === beach.id)?.photos ?? []);
  const rating = useStore((s) => s.beachRatings[beach.id]);

  const [note, setNote] = useState(storeMemoNote);
  const prevBeachIdRef = useRef(beach.id);
  const justSwitchedRef = useRef(false);

  // ビーチ切り替え時: 前のビーチにメモを保存してから、表示を新しいビーチのメモに同期
  useEffect(() => {
    if (prevBeachIdRef.current !== beach.id) {
      setBeachMemo(prevBeachIdRef.current, note);
      prevBeachIdRef.current = beach.id;
      justSwitchedRef.current = true;
      setNote(storeMemoNote);
    }
  }, [beach.id, setBeachMemo, storeMemoNote]);

  // 同一ビーチでのメモ入力時に保存（切り替え直後の1回はスキップ）
  useEffect(() => {
    if (justSwitchedRef.current) {
      justSwitchedRef.current = false;
      return;
    }
    setBeachMemo(beach.id, note);
  }, [note, beach.id, setBeachMemo]);

  const handleOpenMaps = useCallback(() => {
    const encodedName = encodeURIComponent(beach.name);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${beach.lat},${beach.lng}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedName}&ll=${beach.lat},${beach.lng}`;
    const url = Platform.OS === 'ios' ? appleMapsUrl : googleMapsUrl;
    Linking.openURL(url);
  }, [beach]);

  const handleSearchWeb = useCallback(() => {
    const query = encodeURIComponent(`${beach.name} ${beach.cityName} beach`);
    Linking.openURL(`https://www.google.com/search?q=${query}`);
  }, [beach]);

  const handleToggleVisited = useCallback(() => {
    if (visited) {
      unmarkBeachVisited(beach.id);
    } else {
      // 訪問日を記録（現在の日付）
      markBeachVisited(beach.id, new Date().toISOString());
    }
  }, [beach.id, visited, markBeachVisited, unmarkBeachVisited]);

  const handleToggleWantToGo = useCallback(() => {
    if (wantToGo) {
      unmarkBeachWantToGo(beach.id);
    } else {
      markBeachWantToGo(beach.id);
    }
  }, [beach.id, wantToGo, markBeachWantToGo, unmarkBeachWantToGo]);

  const handleAddPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionRequired'), t('permissionPhotoMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      addBeachPhoto(beach.id, result.assets[0].uri);
    }
  }, [beach.id, addBeachPhoto, t]);

  const handleRemovePhoto = useCallback(
    (uri: string) => {
      removeBeachPhoto(beach.id, uri);
    },
    [beach.id, removeBeachPhoto]
  );

  return (
    <View style={styles.content}>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={SUSHI_COLORS.textMuted} />
      </Pressable>

      <View style={styles.nameRow}>
        <Text style={styles.emoji}>{visited ? '✅' : wantToGo ? '⭐' : '🏖️'}</Text>
        <Text style={styles.name}>{beach.name}</Text>
      </View>

      <View style={styles.tagRow}>
        {visited && (
          <View style={styles.visitedTag}>
            <Ionicons name="checkmark-circle" size={16} color={SUSHI_COLORS.accentSecondary} />
            <Text style={styles.visitedTagText}>
              {t('visited')}
              {visitedDate && ` · ${new Date(visitedDate).getFullYear()}`}
            </Text>
          </View>
        )}
        {wantToGo && (
          <View style={styles.wantToGoTag}>
            <Ionicons name="heart" size={16} color={SUSHI_COLORS.primary} />
            <Text style={styles.wantToGoTagText}>{t('wantToGo')}</Text>
          </View>
        )}
      </View>

      {(beach.cityName || beach.countryCode) && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={SUSHI_COLORS.textMuted} />
          <Text style={styles.infoText}>
            {[beach.cityName, beach.countryCode].filter(Boolean).join(' · ')}
            {beach.region && ` · ${beach.region}`}
          </Text>
        </View>
      )}

      {beach.address && (
        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={18} color={SUSHI_COLORS.textMuted} />
          <Text style={styles.infoText} numberOfLines={2}>{beach.address}</Text>
        </View>
      )}

      {beach.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('description')}</Text>
          <Text style={styles.descriptionText}>{beach.description}</Text>
        </View>
      )}

      {/* 有名な食べ物・飲み物セクション */}
      {hasFood || hasDrinks ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('famousFoodAndDrinks')}</Text>
          <View style={styles.foodDrinksContainer}>
            {hasFood && (
              <View style={styles.foodDrinksColumn}>
                <View style={styles.foodDrinksHeader}>
                  <Ionicons name="restaurant" size={18} color={SUSHI_COLORS.accentSecondary} />
                  <Text style={styles.foodDrinksLabel}>{t('food')}</Text>
                </View>
                <View style={styles.foodDrinksItems}>
                  {foodList.map((item, index) => (
                    <View key={index} style={styles.foodDrinksItem}>
                      <Text style={styles.foodDrinksItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {hasDrinks && (
              <View style={styles.foodDrinksColumn}>
                <View style={styles.foodDrinksHeader}>
                  <Ionicons name="wine" size={18} color={SUSHI_COLORS.primary} />
                  <Text style={styles.foodDrinksLabel}>{t('drinks')}</Text>
                </View>
                <View style={styles.foodDrinksItems}>
                  {drinksList.map((item, index) => (
                    <View key={index} style={styles.foodDrinksItem}>
                      <Text style={styles.foodDrinksItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      ) : null}

      {beach.features && beach.features.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('features')}</Text>
          <View style={styles.featuresRow}>
            {beach.features.map((feature, index) => (
              <View key={index} style={styles.featureChip}>
                <Text style={styles.featureChipText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {beach.bestSeason && (
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={SUSHI_COLORS.textMuted} />
          <Text style={styles.infoText}>
            {t('bestSeason')}: {beach.bestSeason}
          </Text>
        </View>
      )}

      {beach.activities && beach.activities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('activities')}</Text>
          <View style={styles.featuresRow}>
            {beach.activities.map((activity, index) => (
              <View key={index} style={styles.featureChip}>
                <Ionicons name="bicycle-outline" size={14} color={SUSHI_COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.featureChipText}>{activity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}


      {hasUniqueExperience && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('uniqueExperience')}</Text>
          <View style={styles.uniqueExperienceBox}>
            <Ionicons name="sparkles-outline" size={20} color={SUSHI_COLORS.accentTertiary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.uniqueExperienceText}>{uniqueExperience}</Text>
          </View>
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="compass-outline" size={18} color={SUSHI_COLORS.textMuted} />
        <Text style={styles.infoText}>
          {t('latLng')} {beach.lat.toFixed(5)}, {beach.lng.toFixed(5)}
        </Text>
      </View>

      {/* 写真 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('sectionPhotos')}</Text>
        <BeachPhotoGallery
          photos={photos}
          onAddPhoto={handleAddPhoto}
          onRemovePhoto={handleRemovePhoto}
          t={t}
        />
      </View>

      {/* 満足度（行ったときのみ・思い出の上） */}
      {visited && (
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>{t('sectionRating')}</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                style={styles.starButton}
                onPress={() => setBeachRating(beach.id, value)}
              >
                <Ionicons
                  name={rating !== undefined && value <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={rating !== undefined && value <= rating ? SUSHI_COLORS.accentTertiary : SUSHI_COLORS.textMuted}
                />
              </Pressable>
            ))}
          </View>
          {rating !== undefined && (
            <Text style={styles.ratingLabel}>{rating} / 5</Text>
          )}
        </View>
      )}

      {/* 思い出 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('sectionMemories')}</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder={t('memoPlaceholder')}
          placeholderTextColor={SUSHI_COLORS.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* 行った・行きたい */}
      <View style={styles.actionButtonRow}>
        <Pressable
          style={[
            styles.visitedButton,
            styles.actionButton,
            visited ? styles.visitedButtonActive : styles.visitedButtonPrimary,
          ]}
          onPress={handleToggleVisited}
        >
          <Ionicons
            name={visited ? 'close-circle-outline' : 'checkmark-circle-outline'}
            size={20}
            color={visited ? SUSHI_COLORS.textMuted : '#fff'}
          />
          <Text style={[styles.visitedButtonText, visited && styles.visitedButtonTextMuted]}>
            {visited ? t('unvisit') : t('visited')}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.wantToGoButton,
            styles.actionButton,
            wantToGo ? styles.wantToGoButtonActive : styles.wantToGoButtonPrimary,
          ]}
          onPress={handleToggleWantToGo}
        >
          <Ionicons
            name={wantToGo ? 'heart-dislike-outline' : 'heart-outline'}
            size={20}
            color={wantToGo ? SUSHI_COLORS.textMuted : '#fff'}
          />
          <Text style={[styles.wantToGoButtonText, wantToGo && styles.wantToGoButtonTextMuted]}>
            {wantToGo ? t('unwantToGo') : t('wantToGo')}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.mapsButton} onPress={handleOpenMaps}>
        <Ionicons name="map-outline" size={20} color={SUSHI_COLORS.primary} />
        <Text style={styles.mapsButtonText}>{t('openInMaps')}</Text>
      </Pressable>

      <Pressable style={styles.webSearchButton} onPress={handleSearchWeb}>
        <Ionicons name="search-outline" size={20} color={SUSHI_COLORS.accentSecondary} />
        <Text style={styles.webSearchButtonText}>{t('searchWeb')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.md,
    padding: SPACING.sm,
    zIndex: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    width: '100%',
    paddingRight: 40,
  },
  emoji: {
    fontSize: 28,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: SUSHI_COLORS.textPrimary,
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    width: '100%',
  },
  visitedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: SUSHI_COLORS.accentSecondary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  visitedTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: SUSHI_COLORS.accentSecondary,
  },
  wantToGoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: SUSHI_COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  wantToGoTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: SUSHI_COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: SUSHI_COLORS.textSecondary,
    flex: 1,
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
    marginTop: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  visitedButton: {},
  visitedButtonPrimary: {
    backgroundColor: SUSHI_COLORS.accentSecondary,
  },
  visitedButtonActive: {
    backgroundColor: SUSHI_COLORS.surface,
  },
  visitedButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  visitedButtonTextMuted: {
    color: SUSHI_COLORS.textMuted,
  },
  wantToGoButton: {},
  wantToGoButtonPrimary: {
    backgroundColor: SUSHI_COLORS.primary,
  },
  wantToGoButtonActive: {
    backgroundColor: SUSHI_COLORS.surface,
  },
  wantToGoButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  wantToGoButtonTextMuted: {
    color: SUSHI_COLORS.textMuted,
  },
  ratingSection: {
    width: '100%',
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  starButton: {
    padding: SPACING.xs,
  },
  ratingLabel: {
    fontSize: 13,
    color: SUSHI_COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SUSHI_COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: SUSHI_COLORS.textSecondary,
    lineHeight: 20,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SUSHI_COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: SUSHI_COLORS.border,
  },
  featureChipText: {
    fontSize: 13,
    color: SUSHI_COLORS.textSecondary,
  },
  uniqueExperienceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: SUSHI_COLORS.accentTertiary + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: SUSHI_COLORS.accentTertiary + '30',
  },
  uniqueExperienceText: {
    flex: 1,
    fontSize: 14,
    color: SUSHI_COLORS.textSecondary,
    lineHeight: 20,
  },
  foodDrinksContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  foodDrinksColumn: {
    flex: 1,
    backgroundColor: SUSHI_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: SUSHI_COLORS.border,
  },
  foodDrinksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  foodDrinksLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SUSHI_COLORS.textPrimary,
  },
  foodDrinksItems: {
    gap: SPACING.xs,
  },
  foodDrinksItem: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  foodDrinksItemText: {
    fontSize: 13,
    color: SUSHI_COLORS.textSecondary,
    lineHeight: 18,
  },
  photoGallery: {
    width: '100%',
  },
  mainPhotoSlot: {
    width: '100%',
    height: MAIN_PHOTO_HEIGHT,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  mainPhotoSlotFilled: {},
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  addPhotoPlaceholder: {
    flex: 1,
    backgroundColor: SUSHI_COLORS.primary + '08',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: SUSHI_COLORS.primary + '30',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  addPhotoEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  addPhotoTitle: { fontSize: 16, fontWeight: '600', color: SUSHI_COLORS.textPrimary, marginBottom: SPACING.xs },
  addPhotoSubtitle: { fontSize: 13, color: SUSHI_COLORS.textMuted },
  subPhotoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  subPhotoSlot: {
    width: SUB_PHOTO_SIZE,
    height: SUB_PHOTO_SIZE,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  subPhotoSlotFilled: {},
  subPhoto: { width: '100%', height: '100%' },
  addPhotoPlaceholderSmall: {
    flex: 1,
    backgroundColor: SUSHI_COLORS.primary + '10',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: SUSHI_COLORS.primary + '30',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPhotoSlot: {
    flex: 1,
    backgroundColor: SUSHI_COLORS.surface,
    borderRadius: RADIUS.md,
    opacity: 0.5,
  },
  noteInput: {
    backgroundColor: SUSHI_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: 15,
    color: SUSHI_COLORS.textPrimary,
    minHeight: 80,
    borderWidth: 1,
    borderColor: SUSHI_COLORS.border,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSHI_COLORS.primary + '15',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
    width: '100%',
  },
  mapsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: SUSHI_COLORS.primary,
  },
  webSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSHI_COLORS.accentSecondary + '15',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
    width: '100%',
  },
  webSearchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: SUSHI_COLORS.accentSecondary,
  },
});
