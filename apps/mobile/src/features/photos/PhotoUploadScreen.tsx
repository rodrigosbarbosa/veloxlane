import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import {
  areRequiredPhotoSlotsFilled,
  getPhotoQcMessage,
  getPhotoQcWarningMessage,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_WIDTH_PX,
  photoSlotDefinitions,
  validatePhotoQc,
} from "@veloxlane/photos";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LaneStripe } from "~/components/LaneStripe";
import { PrimaryButton } from "~/components/PrimaryButton";
import {
  deleteListingPhoto,
  fetchListingPhotos,
  reorderListingPhotos,
  uploadListingPhoto,
} from "~/lib/photos-api";
import type { ListingPhoto } from "~/lib/photos-types";
import { supabase } from "~/lib/supabase";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

type SlotState = {
  photo?: ListingPhoto;
  uploading?: boolean;
  error?: string;
  warnings?: string[];
};

type PhotoUploadScreenProps = {
  listingId: string;
  onContinue?: () => void;
};

export function PhotoUploadScreen({
  listingId,
  onContinue,
}: PhotoUploadScreenProps) {
  const [slots, setSlots] = useState<Record<number, SlotState>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [reorderSource, setReorderSource] = useState<number | null>(null);
  const [contentHashes, setContentHashes] = useState<Record<number, string>>(
    {},
  );

  const refreshPhotos = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Sign in required.");
    }

    const photos = await fetchListingPhotos(session.access_token, listingId);
    const nextSlots: Record<number, SlotState> = {};
    for (const definition of photoSlotDefinitions) {
      const photo = photos.find((item) => item.angle_slot === definition.slot);
      nextSlots[definition.slot] = photo ? { photo } : {};
    }
    setSlots(nextSlots);
  }, [listingId]);

  useEffect(() => {
    void (async () => {
      try {
        await refreshPhotos();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to load photos.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshPhotos]);

  const filledSlots = useMemo(
    () =>
      photoSlotDefinitions
        .filter((definition) => slots[definition.slot]?.photo)
        .map((definition) => definition.slot),
    [slots],
  );

  const canContinue = areRequiredPhotoSlotsFilled(filledSlots);

  const preparePhoto = async (uri: string, slot: number) => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: PHOTO_MAX_WIDTH_PX } }],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    const response = await fetch(manipulated.uri);
    let blob = await response.blob();

    if (blob.size > PHOTO_MAX_BYTES) {
      const retry = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: Math.min(PHOTO_MAX_WIDTH_PX, 1800) } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );
      const retryResponse = await fetch(retry.uri);
      blob = await retryResponse.blob();
    }

    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${manipulated.width}:${manipulated.height}:${blob.size}`,
    );

    const duplicateInOtherSlot = Object.entries(contentHashes).some(
      ([existingSlot, existingHash]) =>
        Number(existingSlot) !== slot && existingHash === hash,
    );

    const qc = validatePhotoQc({
      byteLength: blob.size,
      width: manipulated.width,
      height: manipulated.height,
      duplicateInOtherSlot,
    });

    return { blob, qc, hash };
  };

  const handlePick = async (slot: number) => {
    setMessage(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage("Photo library access is required to upload listing photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setSlots((current) => ({
      ...current,
      [slot]: { ...current[slot], uploading: true, error: undefined },
    }));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sign in required.");
      }

      const prepared = await preparePhoto(result.assets[0].uri, slot);
      if (!prepared.qc.ok && prepared.qc.rejectReason) {
        throw new Error(getPhotoQcMessage(prepared.qc.rejectReason));
      }

      const photos = await uploadListingPhoto(session.access_token, {
        listingId,
        angleSlot: slot,
        blob: prepared.blob,
      });

      setContentHashes((current) => ({ ...current, [slot]: prepared.hash }));

      const nextSlots: Record<number, SlotState> = {};
      for (const definition of photoSlotDefinitions) {
        const photo = photos.find(
          (item) => item.angle_slot === definition.slot,
        );
        nextSlots[definition.slot] = {
          photo,
          warnings:
            definition.slot === slot
              ? prepared.qc.warnings.map(getPhotoQcWarningMessage)
              : slots[definition.slot]?.warnings,
        };
      }
      setSlots(nextSlots);
    } catch (error) {
      setSlots((current) => ({
        ...current,
        [slot]: {
          ...current[slot],
          uploading: false,
          error:
            error instanceof Error ? error.message : "Unable to upload photo.",
        },
      }));
      return;
    }

    setSlots((current) => ({
      ...current,
      [slot]: { ...current[slot], uploading: false },
    }));
  };

  const handleDelete = async (slot: number, photoId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sign in required.");
      }

      await deleteListingPhoto(session.access_token, photoId);
      setContentHashes((current) => {
        const next = { ...current };
        delete next[slot];
        return next;
      });
      setSlots((current) => ({ ...current, [slot]: {} }));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete photo.",
      );
    }
  };

  const handleLongPress = (slot: number) => {
    if (!slots[slot]?.photo) {
      return;
    }
    setReorderSource(slot);
    setMessage(
      `Selected slot ${slot}. Long-press another filled slot to swap.`,
    );
  };

  const handleReorderTarget = async (slot: number) => {
    if (reorderSource === null || reorderSource === slot) {
      return;
    }

    const fromPhoto = slots[reorderSource]?.photo;
    const toPhoto = slots[slot]?.photo;
    if (!fromPhoto && !toPhoto) {
      return;
    }

    const payload = [
      ...(fromPhoto ? [{ photoId: fromPhoto.id, angleSlot: slot }] : []),
      ...(toPhoto ? [{ photoId: toPhoto.id, angleSlot: reorderSource }] : []),
    ];

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sign in required.");
      }

      await reorderListingPhotos(session.access_token, {
        listingId,
        slots: payload,
      });
      setReorderSource(null);
      setMessage(null);
      await refreshPhotos();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to reorder photos.",
      );
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={mobileTheme.colors.action.primaryBg} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: mobileTheme.colors.surface.canvas }}
    >
      <ScrollView
        contentContainerStyle={{ padding: mobileTheme.spacing[5], gap: 16 }}
      >
        <LaneStripe />
        <Text
          style={[textStyle("h2"), { color: mobileTheme.colors.text.onDark }]}
        >
          Add your 10 angles
        </Text>
        <Text
          style={[
            textStyle("body"),
            { color: mobileTheme.colors.text.onDarkMuted },
          ]}
        >
          Driver side, passenger side, front, and rear are required. Long-press
          a filled slot, then long-press another to swap order.
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {photoSlotDefinitions.map((definition) => {
            const slotState = slots[definition.slot] ?? {};
            const photo = slotState.photo;

            return (
              <Pressable
                key={definition.slot}
                onPress={() => {
                  if (reorderSource !== null) {
                    void handleReorderTarget(definition.slot);
                    return;
                  }
                  void handlePick(definition.slot);
                }}
                onLongPress={() => {
                  if (reorderSource !== null) {
                    void handleReorderTarget(definition.slot);
                    return;
                  }
                  handleLongPress(definition.slot);
                }}
                style={{
                  width: "47%",
                  borderWidth: 1,
                  borderColor: mobileTheme.colors.border.default,
                  borderRadius: mobileTheme.radius.md,
                  padding: mobileTheme.spacing[3],
                  backgroundColor: mobileTheme.colors.surface.card,
                }}
              >
                <Text
                  style={[
                    textStyle("caption"),
                    { color: mobileTheme.colors.text.onDarkMuted },
                  ]}
                >
                  {definition.slot}. {definition.label}
                  {definition.required ? " • Required" : ""}
                </Text>

                {photo?.publicUrl ? (
                  <Image
                    source={{ uri: photo.publicUrl }}
                    style={{
                      width: "100%",
                      height: 120,
                      marginTop: 8,
                      borderRadius: mobileTheme.radius.sm,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      height: 120,
                      marginTop: 8,
                      borderRadius: mobileTheme.radius.sm,
                      borderWidth: 1,
                      borderStyle: "dashed",
                      borderColor: mobileTheme.colors.border.subtle,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={[
                        textStyle("caption"),
                        { color: mobileTheme.colors.text.onDarkMuted },
                      ]}
                    >
                      Tap to upload
                    </Text>
                  </View>
                )}

                {slotState.uploading ? (
                  <ActivityIndicator
                    style={{ marginTop: 8 }}
                    color={mobileTheme.colors.action.primaryBg}
                  />
                ) : null}
                {slotState.error ? (
                  <Text
                    style={[
                      textStyle("caption"),
                      {
                        color: mobileTheme.colors.status.warning,
                        marginTop: 8,
                      },
                    ]}
                  >
                    {slotState.error}
                  </Text>
                ) : null}
                {slotState.warnings?.map((warning) => (
                  <Text
                    key={warning}
                    style={[
                      textStyle("caption"),
                      {
                        color: mobileTheme.colors.status.warning,
                        marginTop: 4,
                      },
                    ]}
                  >
                    {warning}
                  </Text>
                ))}

                {photo ? (
                  <Pressable
                    onPress={() => {
                      void handleDelete(definition.slot, photo.id);
                    }}
                    style={{ marginTop: 8 }}
                  >
                    <Text
                      style={[
                        textStyle("caption"),
                        { color: mobileTheme.colors.action.primaryBg },
                      ]}
                    >
                      Remove
                    </Text>
                  </Pressable>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {message ? (
          <Text
            style={[
              textStyle("body"),
              { color: mobileTheme.colors.text.onDarkMuted },
            ]}
          >
            {message}
          </Text>
        ) : null}

        <PrimaryButton
          label="Continue to pricing"
          disabled={!canContinue}
          onPress={onContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
