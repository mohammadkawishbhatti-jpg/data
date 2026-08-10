import React, { useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Platform, RefreshControl, useWindowDimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPortalQuotes, Quote } from '@/lib/api';

// ─── Status config ────────────────────────────────────────────────────────────

const QUOTE_STATUS_LABEL: Record<string, string> = {
  new:       'New',
  reviewing: 'Under Review',
  quoted:    'Quoted',
  accepted:  'Accepted',
  rejected:  'Rejected',
  closed:    'Closed',
};
const QUOTE_STATUS_COLOR: Record<string, string> = {
  new:       '#3B82F6',
  reviewing: '#F59E0B',
  quoted:    '#8B5CF6',
  accepted:  '#22C55E',
  rejected:  '#EF4444',
  closed:    '#6B7280',
};
const QUOTE_STATUS_BG: Record<string, string> = {
  new:       '#EFF6FF',
  reviewing: '#FFFBEB',
  quoted:    '#F5F3FF',
  accepted:  '#F0FDF4',
  rejected:  '#FEF2F2',
  closed:    '#F9FAFB',
};

// ─── QuoteCard ────────────────────────────────────────────────────────────────

function QuoteCard({ quote, colors }: { quote: Quote; colors: any }) {
  const statusColor = QUOTE_STATUS_COLOR[quote.status] ?? '#6B7280';
  const statusBg    = QUOTE_STATUS_BG[quote.status]    ?? '#F9FAFB';
  const statusLabel = QUOTE_STATUS_LABEL[quote.status] ?? quote.status;

  const pills = [
    quote.quantity    && { icon: 'layers'     as const, text: `Qty: ${quote.quantity}` },
    quote.dimensions  && { icon: 'maximize-2' as const, text: quote.dimensions },
    quote.material    && { icon: 'box'        as const, text: quote.material },
    quote.printingDetails && { icon: 'printer' as const, text: quote.printingDetails },
  ].filter(Boolean) as Array<{ icon: keyof typeof Feather.glyphMap; text: string }>;

  return (
    <View style={[qc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header row */}
      <View style={qc.header}>
        <View style={qc.headerLeft}>
          <View style={[qc.iconBox, { backgroundColor: colors.secondary }]}>
            <Feather name="file-text" size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={[qc.productType, { color: colors.foreground }]} numberOfLines={1}>
              {quote.productType ?? 'Custom Packaging'}
            </Text>
            <Text style={[qc.dateText, { color: colors.mutedForeground }]}>
              {new Date(quote.createdAt).toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View style={[qc.badge, { backgroundColor: statusBg, borderColor: statusColor + '40' }]}>
          <View style={[qc.badgeDot, { backgroundColor: statusColor }]} />
          <Text style={[qc.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Pills */}
      {pills.length > 0 && (
        <View style={qc.pills}>
          {pills.map((p, i) => (
            <View key={i} style={[qc.pill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name={p.icon} size={11} color={colors.mutedForeground} />
              <Text style={[qc.pillText, { color: colors.foreground }]} numberOfLines={1}>{p.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {!!quote.additionalNotes && (
        <Text style={[qc.notes, { color: colors.mutedForeground, borderTopColor: colors.border }]} numberOfLines={2}>
          {quote.additionalNotes}
        </Text>
      )}
    </View>
  );
}

const qc = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  productType: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  dateText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 14 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  pillText: { fontSize: 11, fontFamily: 'Inter_500Medium', maxWidth: 120 },
  notes: {
    fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18,
    borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (!customer) return <Redirect href="/" />;

  const { data: quotes, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['portal-quotes'],
    queryFn: fetchPortalQuotes,
  });

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const topPad = Platform.OS === 'web' ? 0 : insets.top;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.primary, paddingTop: topPad + (isDesktop ? 20 : 16) }]}>
        <View style={[s.headerInner, isDesktop && { maxWidth: 900, alignSelf: 'center', width: '100%' }]}>
          <View>
            <Text style={s.headerTitle}>My Quotes</Text>
            <Text style={s.headerSub}>Track your quote requests</Text>
          </View>
          <View style={[s.countBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={s.countNum}>{quotes?.length ?? '—'}</Text>
            <Text style={s.countLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : isError ? (
        <View style={s.center}>
          <Feather name="wifi-off" size={32} color={colors.mutedForeground} />
          <Text style={[s.errorText, { color: colors.mutedForeground }]}>Could not load quotes.</Text>
        </View>
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={q => String(q.id)}
          contentContainerStyle={[
            s.list,
            { paddingBottom: bottomPad + 80 },
            isDesktop && { maxWidth: 900, alignSelf: 'center', width: '100%' },
          ]}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <View style={[s.emptyIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="file-text" size={28} color={colors.mutedForeground} />
              </View>
              <Text style={[s.emptyTitle, { color: colors.foreground }]}>No quotes yet</Text>
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>
                Quote requests you submit will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => <QuoteCard quote={item} colors={colors} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  countBadge: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  countNum: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },
  countLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium', marginTop: 1 },
  list: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  errorText: { fontSize: 14, fontFamily: 'Inter_500Medium', marginTop: 8 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});
