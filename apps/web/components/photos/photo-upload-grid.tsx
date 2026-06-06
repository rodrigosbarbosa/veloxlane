"use client";

import {
  areRequiredPhotoSlotsFilled,
  getPhotoQcMessage,
  getPhotoQcWarningMessage,
  photoSlotDefinitions,
} from "@veloxlane/photos";
import { GripVertical, Trash2, UploadCloud } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { preparePhotoForUpload } from "@/lib/photos/compress";
import {
  deleteListingPhoto,
  fetchListingPhotos,
  reorderListingPhotos,
  uploadPreparedPhoto,
  type ListingPhoto,
} from "@/lib/photos/client";

type SlotState = {
  photo?: ListingPhoto;
  previewUrl?: string;
  uploading?: boolean;
  error?: string;
  warnings?: string[];
};

type PhotoUploadGridProps = {
  listingId: string;
  onContinue?: () => void;
};

export function PhotoUploadGrid({
  listingId,
  onContinue,
}: PhotoUploadGridProps) {
  const [slots, setSlots] = useState<Record<number, SlotState>>({});
  const [dragSlot, setDragSlot] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentHashes, setContentHashes] = useState<Record<number, string>>(
    {},
  );

  const refreshPhotos = useCallback(async () => {
    const photos = await fetchListingPhotos(listingId);
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

  const handleFile = async (slot: number, file: File) => {
    setMessage(null);
    setSlots((current) => ({
      ...current,
      [slot]: {
        ...current[slot],
        uploading: true,
        error: undefined,
        warnings: undefined,
      },
    }));

    try {
      const duplicateHashes = Object.entries(contentHashes)
        .filter(([existingSlot]) => Number(existingSlot) !== slot)
        .map(([, hash]) => hash);

      const prepared = await preparePhotoForUpload(file, { duplicateHashes });
      if (!prepared.qc.ok && prepared.qc.rejectReason) {
        throw new Error(getPhotoQcMessage(prepared.qc.rejectReason));
      }

      const photos = await uploadPreparedPhoto({
        listingId,
        angleSlot: slot,
        blob: prepared.blob,
      });

      setContentHashes((current) => ({
        ...current,
        [slot]: prepared.contentHash,
      }));

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
      [slot]: {
        ...current[slot],
        uploading: false,
      },
    }));
  };

  const handleDrop = (slot: number, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (file) {
      void handleFile(slot, file);
    }
  };

  const handleDelete = async (slot: number, photoId: string) => {
    setMessage(null);
    try {
      await deleteListingPhoto(photoId);
      setContentHashes((current) => {
        const next = { ...current };
        delete next[slot];
        return next;
      });
      setSlots((current) => ({
        ...current,
        [slot]: {},
      }));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete photo.",
      );
    }
  };

  const swapSlots = async (fromSlot: number, toSlot: number) => {
    const fromPhoto = slots[fromSlot]?.photo;
    const toPhoto = slots[toSlot]?.photo;
    if (!fromPhoto && !toPhoto) {
      return;
    }

    const reorderPayload = [
      ...(fromPhoto ? [{ photoId: fromPhoto.id, angleSlot: toSlot }] : []),
      ...(toPhoto ? [{ photoId: toPhoto.id, angleSlot: fromSlot }] : []),
    ];

    if (reorderPayload.length === 0) {
      return;
    }

    try {
      await reorderListingPhotos({
        listingId,
        slots: reorderPayload,
      });
      await refreshPhotos();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to reorder photos.",
      );
    }
  };

  if (loading) {
    return <p className="photo-upload-loading">Loading your photo draft…</p>;
  }

  return (
    <div className="photo-upload-panel">
      <div className="photo-upload-header">
        <div>
          <p className="hero-eyebrow">Guided listing photos</p>
          <h2 className="hero-title">Add your 10 angles</h2>
          <p className="hero-copy">
            Driver side, passenger side, front, and rear are required before you
            continue. Extra angles help buyers trust the listing.
          </p>
        </div>
        <p className="photo-upload-progress">
          {filledSlots.length} of 10 uploaded
        </p>
      </div>

      <div className="photo-upload-grid">
        {photoSlotDefinitions.map((definition) => {
          const slotState = slots[definition.slot] ?? {};
          const photo = slotState.photo;
          const preview = slotState.previewUrl ?? photo?.publicUrl ?? null;

          return (
            <article
              key={definition.slot}
              className={`photo-slot-card ${definition.required ? "photo-slot-required" : ""}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(definition.slot, event)}
            >
              <div className="photo-slot-card-header">
                <div>
                  <p className="photo-slot-number">{definition.slot}</p>
                  <h3 className="photo-slot-label">{definition.label}</h3>
                  {definition.required ? (
                    <p className="photo-slot-badge">Required</p>
                  ) : null}
                </div>
                {photo ? (
                  <button
                    type="button"
                    className="photo-slot-drag-handle"
                    draggable
                    aria-label={`Reorder ${definition.label}`}
                    onDragStart={() => setDragSlot(definition.slot)}
                    onDragEnd={() => {
                      void (async () => {
                        if (dragSlot !== null && dragSlot !== definition.slot) {
                          await swapSlots(dragSlot, definition.slot);
                        }
                        setDragSlot(null);
                      })();
                    }}
                  >
                    <GripVertical aria-hidden className="size-4" />
                  </button>
                ) : null}
              </div>

              <label className="photo-slot-dropzone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,.heic"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.item(0);
                    if (file) {
                      void handleFile(definition.slot, file);
                    }
                    event.target.value = "";
                  }}
                />
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt={definition.label}
                    className="photo-slot-preview"
                  />
                ) : (
                  <div className="photo-slot-empty">
                    <UploadCloud aria-hidden className="size-6" />
                    <span>Drop photo or click to upload</span>
                  </div>
                )}
              </label>

              {slotState.uploading ? (
                <p className="photo-slot-status">Uploading…</p>
              ) : null}
              {slotState.error ? (
                <p className="photo-slot-error" role="alert">
                  {slotState.error}
                </p>
              ) : null}
              {slotState.warnings?.map((warning) => (
                <p key={warning} className="photo-slot-warning">
                  {warning}
                </p>
              ))}

              {photo ? (
                <button
                  type="button"
                  className="photo-slot-delete"
                  onClick={() => {
                    void handleDelete(definition.slot, photo.id);
                  }}
                >
                  <Trash2 aria-hidden className="size-4" />
                  Remove
                </button>
              ) : null}
            </article>
          );
        })}
      </div>

      {message ? <p className="photo-upload-message">{message}</p> : null}

      <div className="photo-upload-actions">
        <Button type="button" disabled={!canContinue} onClick={onContinue}>
          Continue to pricing
        </Button>
        {!canContinue ? (
          <p className="photo-upload-helper">
            Upload driver side, passenger side, front, and rear to continue.
          </p>
        ) : null}
      </div>
    </div>
  );
}
