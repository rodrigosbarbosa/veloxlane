import { copy, tagline } from "@veloxlane/brand/copy";
import { getPriceRangePosition, type VinLookupPreview } from "@veloxlane/vin";
import { AlertTriangle, BadgeCheck, ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";

import { PrimaryButton } from "~/components/PrimaryButton";
import { mobileTheme, textStyle } from "~/theme/mobileTheme";

type VinPreviewCardProps = {
  preview: VinLookupPreview;
  confirming?: boolean;
  confirmError?: string | null;
  onConfirm: () => void;
  onEdit: () => void;
};

function formatCurrency(value: number | undefined): string {
  if (value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function VinPreviewCard({
  preview,
  confirming = false,
  confirmError = null,
  onConfirm,
  onEdit,
}: VinPreviewCardProps) {
  const vehicleTitle = [preview.year, preview.make, preview.model]
    .filter(Boolean)
    .join(" ");

  const low = preview.marketcheck?.fairPriceLow;
  const high = preview.marketcheck?.fairPriceHigh;
  const mid = preview.marketcheck?.fairPriceMid;
  const rangePosition = getPriceRangePosition(mid, low, high);
  const recallCount = preview.nhtsa?.recallCount ?? 0;

  const fillColor =
    rangePosition === "below"
      ? mobileTheme.colors.status.verifiedBg
      : rangePosition === "above"
        ? mobileTheme.colors.status.warningBg
        : mobileTheme.colors.status.verifiedBg;

  return (
    <View
      style={{
        backgroundColor: mobileTheme.colors.surface.card,
        borderRadius: mobileTheme.radius.md,
        gap: mobileTheme.spacing[5],
        padding: mobileTheme.spacing[5],
      }}
    >
      <View style={{ gap: mobileTheme.spacing[3] }}>
        <Text
          style={[
            textStyle("overline"),
            { color: mobileTheme.colors.text.secondary },
          ]}
        >
          Vehicle match
        </Text>
        <Text
          style={[textStyle("h3"), { color: mobileTheme.colors.text.primary }]}
        >
          {vehicleTitle || "Vehicle details pending"}
        </Text>
        <Text
          style={[
            textStyle("mono"),
            { color: mobileTheme.colors.text.secondary, letterSpacing: 1 },
          ]}
        >
          {preview.vin}
        </Text>
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: mobileTheme.colors.status.verifiedBg,
            borderRadius: mobileTheme.radius.pill,
            flexDirection: "row",
            gap: mobileTheme.spacing[2],
            paddingHorizontal: mobileTheme.spacing[4],
            paddingVertical: mobileTheme.spacing[2],
          }}
        >
          <BadgeCheck color={mobileTheme.colors.status.verified} size={18} />
          <Text
            style={[
              textStyle("label"),
              { color: mobileTheme.colors.status.verified },
            ]}
          >
            {copy.escrowProtected}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: mobileTheme.spacing[3],
        }}
      >
        <Stat
          label="CARFAX accidents"
          value={String(preview.carfax?.accidentCount ?? "—")}
        />
        <Stat
          label="Owners"
          value={String(preview.carfax?.ownerCount ?? "—")}
        />
        <Stat label="Open recalls" value={String(recallCount)} />
      </View>

      {preview.errors?.carfax ? <Note text={preview.errors.carfax} /> : null}
      {recallCount > 0 ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: mobileTheme.spacing[2],
          }}
        >
          <AlertTriangle color={mobileTheme.colors.status.warning} size={16} />
          <Note text="Check NHTSA before you list." warning />
        </View>
      ) : null}
      {preview.errors?.nhtsa ? <Note text={preview.errors.nhtsa} /> : null}

      <View style={{ gap: mobileTheme.spacing[3] }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              textStyle("overline"),
              { color: mobileTheme.colors.text.secondary },
            ]}
          >
            Fair market range
          </Text>
          <Text
            style={[
              textStyle("label"),
              { color: mobileTheme.colors.text.primary },
            ]}
          >
            {formatCurrency(low)} – {formatCurrency(high)}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: mobileTheme.colors.surface.muted,
            borderRadius: mobileTheme.radius.pill,
            height: 10,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              backgroundColor: fillColor,
              height: "100%",
              marginHorizontal: "18%",
            }}
          />
        </View>
        {preview.marketcheck?.fairPriceMid ? (
          <Note
            text={`Mid-market estimate: ${formatCurrency(preview.marketcheck.fairPriceMid)}`}
          />
        ) : null}
        {preview.errors?.marketcheck ? (
          <Note text={preview.errors.marketcheck} />
        ) : null}
      </View>

      <PrimaryButton
        disabled={confirming}
        label={confirming ? "Saving draft…" : "Looks right — continue"}
        onPress={onConfirm}
      />
      {confirmError ? <Note text={confirmError} warning /> : null}
      <PrimaryButton
        label="Edit VIN"
        onPress={onEdit}
        style={{ backgroundColor: mobileTheme.colors.surface.card }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: mobileTheme.spacing[2],
        }}
      >
        <ShieldCheck color={mobileTheme.colors.text.secondary} size={16} />
        <Text
          style={[
            textStyle("caption"),
            { color: mobileTheme.colors.text.secondary },
          ]}
        >
          {tagline}
        </Text>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        borderColor: mobileTheme.colors.border.subtle,
        borderRadius: mobileTheme.radius.sm,
        borderWidth: 1,
        minWidth: "30%",
        padding: mobileTheme.spacing[4],
      }}
    >
      <Text
        style={[
          textStyle("overline"),
          { color: mobileTheme.colors.text.secondary },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[textStyle("h4"), { color: mobileTheme.colors.text.primary }]}
      >
        {value}
      </Text>
    </View>
  );
}

function Note({ text, warning = false }: { text: string; warning?: boolean }) {
  return (
    <Text
      style={[
        textStyle("bodySm"),
        {
          color: warning
            ? mobileTheme.colors.status.warning
            : mobileTheme.colors.text.secondary,
        },
      ]}
    >
      {text}
    </Text>
  );
}
