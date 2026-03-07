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
import {
  getBeachDisplayName,
  getBeachDisplayDescription,
  getBeachDisplayFeatures,
  getBeachDisplayBestSeason,
  getBeachDisplayLocation,
  getBeachDisplayCityName,
} from '../data/beachData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;
const MAIN_PHOTO_HEIGHT = 160;
const SUB_PHOTO_SIZE = (PHOTO_WIDTH - SPACING.sm * 2) / 3;

// Default food & drinks by country (used when beach data has none)
const DEFAULT_FOOD_BY_COUNTRY: Record<string, string[]> = {
  US: ['Poke', 'Loco moco', 'Garlic shrimp'],
  PR: ['Mofongo', 'Frituras (fried plantains)'],
  AW: ['Seafood', 'Keshi yena'],
  BB: ['Flying fish', 'Cou-cou'],
  ID: ['Nasi goreng', 'Mie goreng', 'Satay'],
  TH: ['Tom yum', 'Pad thai', 'Green curry'],
  SG: ['Chicken rice', 'Chili crab'],
  JP: ['Okinawa soba', 'Rafute', 'Sea grapes'],
  AU: ['Fish & chips', 'Aussie beef steak'],
  FR: ['Bouillabaisse', 'Seafood platter'],
  GR: ['Gyro', 'Greek salad'],
  PT: ['Bacalhau', 'Seafood risotto'],
  MX: ['Tacos', 'Ceviche'],
  BR: ['Churrasco', 'Moqueca'],
  ZA: ['Seafood platter', 'Bobotie'],
  AE: ['Meze', 'Grilled kebabs'],
  VE: ['Arepa', 'Seafood'],
  MV: ['Seafood grill', 'Mas huni'],
  PF: ['Poisson cru', 'Polynesian BBQ'],
  PH: ['Filipino cuisine', 'Lechon'],
  SC: ['Creole cuisine', 'Grilled fish'],
  DO: ['Mangú', 'Sancocho', 'Chicharrón'],
  FJ: ['Lovo', 'Kokoda', 'Taro leaves'],
  TZ: ['Pilau', 'Coconut fish', 'Chapati'],
  IT: ['Pasta', 'Seafood', 'Limoncello'],
  ES: ['Paella', 'Tapas', 'Churros'],
};

const DEFAULT_DRINKS_BY_COUNTRY: Record<string, string[]> = {
  US: ['Mai Tai', 'Piña colada', 'Kona coffee'],
  PR: ['Piña colada', 'Rum cocktails'],
  AW: ['Rum punch', 'Tropical cocktails'],
  BB: ['Rum', 'Rum punch'],
  ID: ['Bali coffee', 'Tropical juice'],
  TH: ['Singha beer', 'Thai iced tea'],
  SG: ['Singapore Sling', 'Tiger beer'],
  JP: ['Orion beer', 'Awamori'],
  AU: ['Australian wine', 'Craft beer'],
  FR: ['Rosé wine', 'Sparkling wine'],
  GR: ['Ouzo', 'Greek wine'],
  PT: ['Port wine', 'Vinho verde'],
  MX: ['Margarita', 'Tequila'],
  BR: ['Caipirinha', 'Brazilian beer'],
  ZA: ['South African wine', 'Craft beer'],
  AE: ['Mocktail', 'Mint lemonade'],
  VE: ['Tropical juice', 'Rum cocktails'],
  MV: ['Coconut water', 'Tropical juice'],
  PF: ['Tropical cocktails', 'Coconut water'],
  PH: ['San Miguel beer', 'Tropical cocktails'],
  SC: ['Seybrew beer', 'Coconut water'],
  DO: ['Mamajuana', 'Rum', 'Presidente beer'],
  FJ: ['Fiji Bitter', 'Kava', 'Coconut water'],
  TZ: ['Serengeti beer', 'Spiced tea'],
  IT: ['Aperol Spritz', 'Italian wine'],
  ES: ['Sangria', 'Cava'],
};

const DEFAULT_UNIQUE_EXPERIENCE_BY_COUNTRY: Record<string, string> = {
  US: 'A relaxed stroll along the beach with rainbows and sunset.',
  PR: 'Endless white sand against the deep blue Caribbean Sea.',
  AW: 'Quiet dusk at a beach famous for sea turtle nesting.',
  BB: 'A lazy day on pink-tinted sand with turquoise waters.',
  ID: 'Spa and Balinese massage within minutes of the beach.',
  TH: 'Live music at a beach bar with street food and sunset.',
  SG: 'Resort island near the city—urban and beach in one trip.',
  JP: 'Emerald waters and starry skies on a tropical night.',
  AU: 'Walk the promenade with surfers, then relax at a café.',
  FR: 'Beach and café culture against Mediterranean light and old towns.',
  GR: 'White villages and Aegean blue with sunset from the cliffs.',
  PT: 'Beach near Lisbon combined with old-town sightseeing.',
  MX: 'Mayan ruins and Caribbean beach in one special location.',
  BR: 'Music, soccer, and ocean along Copacabana promenade.',
  ZA: 'Dramatic sunset and Atlantic waves with Table Mountain behind.',
  AE: 'Luxury beach time with futuristic high-rises in the backdrop.',
  VE: 'Quiet Caribbean vibe on a low-key beach all to yourself.',
  MV: 'Step from your overwater villa straight into snorkeling.',
  PF: 'Spend the day gazing at turquoise lagoon from your cottage.',
  PH: 'Barefoot on white sand, hopping beach bars at sunset.',
  SC: 'Rare scenery of giant rocks and white sand in peace.',
  DO: 'All-inclusive beach days with swaying palms and clear waters.',
  FJ: 'Friendly Bula spirit and blue Pacific waters.',
  TZ: 'Stone Town and spice markets with white sand beaches.',
  IT: 'Cliff-side towns and Mediterranean views on the Amalfi Coast.',
  ES: 'Iconic beach clubs and sunset parties on the party island.',
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

  // Food & drinks: prefer En versions (English-only app)
  const defaultFood = DEFAULT_FOOD_BY_COUNTRY[beach.countryCode] ?? [];
  const defaultDrinks = DEFAULT_DRINKS_BY_COUNTRY[beach.countryCode] ?? [];
  const foodList = (beach.foodEn?.length ? beach.foodEn : beach.food?.length ? beach.food : defaultFood);
  const drinksList = (beach.drinksEn?.length ? beach.drinksEn : beach.drinks?.length ? beach.drinks : defaultDrinks);
  const hasFood = foodList.length > 0;
  const hasDrinks = drinksList.length > 0;
  const defaultUniqueExperience = DEFAULT_UNIQUE_EXPERIENCE_BY_COUNTRY[beach.countryCode];
  const uniqueExperience = beach.uniqueExperienceEn || beach.uniqueExperience || defaultUniqueExperience;
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
    const encodedName = encodeURIComponent(getBeachDisplayName(beach));
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${beach.lat},${beach.lng}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedName}&ll=${beach.lat},${beach.lng}`;
    const url = Platform.OS === 'ios' ? appleMapsUrl : googleMapsUrl;
    Linking.openURL(url);
  }, [beach]);

  const handleSearchWeb = useCallback(() => {
    const city = getBeachDisplayCityName(beach) || getBeachDisplayName(beach);
    const query = encodeURIComponent(`${getBeachDisplayName(beach)} ${city} beach`);
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
        <Text style={styles.name}>{getBeachDisplayName(beach)}</Text>
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

      {(beach.cityName || beach.countryCode || beach.address) && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={SUSHI_COLORS.textMuted} />
          <Text style={styles.infoText} numberOfLines={2}>
            {beach.address || getBeachDisplayLocation(beach)}
          </Text>
        </View>
      )}

      {beach.address && (
        <View style={styles.infoRow}>
          <Ionicons name="navigate-outline" size={18} color={SUSHI_COLORS.textMuted} />
          <Text style={styles.infoText} numberOfLines={2}>{beach.address}</Text>
        </View>
      )}

      {(beach.description || beach.descriptionEn) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('description')}</Text>
          <Text style={styles.descriptionText}>{getBeachDisplayDescription(beach)}</Text>
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

      {getBeachDisplayFeatures(beach).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('features')}</Text>
          <View style={styles.featuresRow}>
            {getBeachDisplayFeatures(beach).map((feature, index) => (
              <View key={index} style={styles.featureChip}>
                <Text style={styles.featureChipText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {(beach.bestSeason || beach.bestSeasonEn) && (
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={SUSHI_COLORS.textMuted} />
          <Text style={styles.infoText}>
            {t('bestSeason')}: {getBeachDisplayBestSeason(beach)}
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
        {/* 星5つの評価（写真の下） */}
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
      </View>

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
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: SUSHI_COLORS.border,
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
