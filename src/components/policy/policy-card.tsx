import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { PolicyCategory } from "@/types/PolicyType";
import { PolicyWithId } from "@/types/PolicyTypeWithId";
import { formatDateToShortMonth } from "@/utils/formatDateToShortMonth";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface PolicyCardProps {
  policy: PolicyWithId;
  onPress: (id: string) => void;
}

const policyTypeIcon: Record<PolicyCategory, string> = {
  car: "🚗",
  van: "🚐",
  motorbike: "🏍️",
  house: "🏠",
};

const policyTypeLabel: Record<PolicyCategory, string> = {
  car: "Car",
  van: "Van",
  motorbike: "Motorbike",
  house: "House",
};

export const PolicyCard = React.memo(function PolicyCard({
  policy,
  onPress,
}: PolicyCardProps) {
  const cardBackground = useThemeColor({}, "cardBackground");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const dividerColor = useThemeColor({}, "tint");

  const start = formatDateToShortMonth(policy.startDate);
  const end = formatDateToShortMonth(policy.endDate);

  return (
    <Pressable
      onPress={() => onPress(policy.id)}
      accessibilityRole="button"
      accessibilityLabel={`${policyTypeLabel[policy.policyType]} policy from ${
        policy.provider
      }, ${policy.premium} premium. Starts ${start}, ends ${end}.`}
      hitSlop={8}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardBackground, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <ThemedText style={styles.policyIcon}>
            {policyTypeIcon[policy.policyType]}
          </ThemedText>
          <View style={styles.cardTitleContainer}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.provider}
              numberOfLines={1}
            >
              {policy.provider}
            </ThemedText>
            <ThemedText
              style={[styles.policyType, { color: textColor }]}
              numberOfLines={1}
            >
              {policyTypeLabel[policy.policyType]}
            </ThemedText>
          </View>
        </View>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.premium, { color: tintColor }]}
        >
          {policy.premium}
        </ThemedText>
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Policy Number:</ThemedText>
          <ThemedText style={styles.detailValue} numberOfLines={1}>
            {policy.policyNumber}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Start Date:</ThemedText>
          <ThemedText style={styles.detailValue}>{start}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>End Date:</ThemedText>
          <ThemedText style={styles.detailValue}>{end}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    // Prefer themed shadows or platform-specific elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  policyIcon: { fontSize: 32 },
  cardTitleContainer: { flex: 1 },
  provider: { fontSize: 18, marginBottom: 2 },
  policyType: { fontSize: 14, opacity: 0.7 },
  premium: { fontSize: 20, fontWeight: "700", marginLeft: 8 },
  divider: { height: 1, marginBottom: 12 },
  cardDetails: { gap: 8 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 14, opacity: 0.7 },
  detailValue: { fontSize: 14, fontWeight: "500", maxWidth: "60%" },
});
