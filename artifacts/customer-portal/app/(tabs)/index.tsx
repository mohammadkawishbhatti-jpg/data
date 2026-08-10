import React, { useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, RefreshControl, useWindowDimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPortalOrders, Order } from '@/lib/api';

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_STEPS = ['confirmed', 'processing', 'production', 'quality_check', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed', processing: 'Processing', production: 'In Production',
  quality_check: 'QC', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#3B82F6', processing: '#F59E0B', production: '#F97316',
  quality_check: '#8B5CF6', shipped: '#06B6D4', delivered: '#22C55E', cancelled: '#EF4444',
};
const STATUS_BG: Record<string, string> = {
  confirmed: '#EFF6FF', processing: '#FFFBEB', production: '#FFF7ED',
  quality_check: '#F5F3FF', shipped: '#ECFEFF', delivered: '#F0FDF4', cancelled: '#FEF2F2',
};
const CURRENCY_SYMS: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', PKR: '₨', AED: 'د.إ' };

// ─── Mini timeline ────────────────────────────────────────────────────────────

function StatusTimeline({ status, colors }: { status: string; colors: any }) {
  if (status === 'cancelled') {
    return (
      <View style={[tl.cancelBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
        <Feather name="x-circle" size={12} color="#EF4444" />
        <Text style={tl.cancelText}>Order Cancelled</Text>
      </View>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <View style={tl.row}>
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={step}>
            <View style={tl.stepCol}>
              <View style={[
                tl.dot,
                { backgroundColor: done ? colors.primary : colors.border },
                active && { borderWidth: 2, borderColor: colors.accent, backgroundColor: colors.primary },
              ]}>
                {i < currentIdx && <Feather name="check" size={8} color="#fff" />}
              </View>
              <Text style={[tl.label, { color: done ? colors.primary : colors.mutedForeground }]} numberOfLines={1}>
                {STATUS_LABELS[step]}
              </Text>
            </View>
            {i < STATUS_STEPS.length - 1 && (
              <View style={[tl.line, { backgroundColor: i < currentIdx ? colors.primary : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const tl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 14 },
  stepCol: { alignItems: 'center', width: 42 },
  dot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 8, marginTop: 4, textAlign: 'center', fontFamily: 'Inter_600SemiBold' },
  line: { flex: 1, height: 2, marginTop: 9 },
  cancelBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, marginTop: 10,
    alignSelf: 'flex-start',
  },
  cancelText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#EF4444' },
});

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order, colors, onPress }: { order: Order; colors: any; onPress: () => void }) {
  const sym = CURRENCY_SYMS[order.currency ?? 'USD'] ?? '$';
  const statusColor = STATUS_COLORS[order.status] ?? '#6B7280';
  const statusBg    = STATUS_BG[order.status]    ?? '#F9FAFB';
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;

  return (
    <TouchableOpacity
      style={[oc.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Top accent bar */}
      <View style={[oc.accentBar, { backgroundColor: statusColor }]} />

      <View style={oc.body}>
        {/* Header */}
        <View style={oc.row}>
          <View style={oc.left}>
            <Text style={[oc.orderNum, { color: colors.foreground }]}>{order.orderNumber}</Text>
            <Text style={[oc.date, { color: colors.mutedForeground }]}>
              {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <View style={oc.right}>
            <Text style={[oc.total, { color: colors.primary }]}>{sym}{Number(order.total ?? 0).toFixed(2)}</Text>
            <View style={[oc.badge, { backgroundColor: statusBg, borderColor: statusColor + '40' }]}>
              <View style={[oc.badgeDot, { backgroundColor: statusColor }]} />
              <Text style={[oc.badgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* Tracking */}
        {!!order.trackingNumber && (
          <View style={[oc.trackRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="truck" size={12} color="#3B82F6" />
            <Text style={[oc.trackLabel, { color: colors.mutedForeground }]}>Tracking: </Text>
            <Text style={[oc.trackNum, { color: colors.primary }]}>{order.trackingNumber}</Text>
          </View>
        )}

        {/* Timeline */}
        <StatusTimeline status={order.status} colors={colors} />

        {/* View button */}
        <View style={[oc.viewBtn, { borderTopColor: colors.border }]}>
          <Text style={[oc.viewText, { color: colors.primary }]}>View Details</Text>
          <Feather name="chevron-right" size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const oc = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
    overflow: 'hidden',
  },
  accentBar: { height: 4 },
  body: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 6 },
  orderNum: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  total: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  trackRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
    alignSelf: 'flex-start',
  },
  trackLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  trackNum: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 4, paddingTop: 12, marginTop: 10, borderTopWidth: 1,
  },
  viewText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { customer } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (!customer) return <Redirect href="/" />;

  const { data: orders, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['portal-orders'],
    queryFn: fetchPortalOrders,
  });

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  const activeCount    = orders?.filter(o => !['delivered', 'cancelled'].includes(o.status)).length ?? 0;
  const deliveredCount = orders?.filter(o => o.status === 'delivered').length ?? 0;

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const topPad    = Platform.OS === 'web' ? 0 : insets.top;

  const initials = (customer.name ?? '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const stats = [
    { label: 'Total',     value: orders?.length ?? '—', icon: 'package'   as const, color: colors.primary },
    { label: 'Active',    value: isLoading ? '—' : activeCount,    icon: 'clock'     as const, color: '#F59E0B' },
    { label: 'Delivered', value: isLoading ? '—' : deliveredCount, icon: 'check-circle' as const, color: '#22C55E' },
  ];

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Hero header */}
      <View style={[s.hero, { backgroundColor: colors.primary, paddingTop: topPad + (isDesktop ? 20 : 16) }]}>
        <View style={[s.heroInner, isDesktop && s.heroInnerDesktop]}>
          <View style={s.heroRow}>
            <View>
              <Text style={s.heroGreet}>Hello, {customer.name.split(' ')[0]} 👋</Text>
              <Text style={s.heroSub}>Here are your orders</Text>
            </View>
            <View style={[s.avatar, { backgroundColor: colors.accent }]}>
              <Text style={[s.avatarText, { color: colors.primary }]}>{initials}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {stats.map(st => (
              <View key={st.label} style={[s.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Feather name={st.icon} size={16} color={st.color} />
                <Text style={s.statNum}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : isError ? (
        <View style={s.center}>
          <Feather name="wifi-off" size={32} color={colors.mutedForeground} />
          <Text style={[s.errText, { color: colors.mutedForeground }]}>Could not load orders.</Text>
          <TouchableOpacity style={[s.retryBtn, { backgroundColor: colors.primary }]} onPress={() => refetch()}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => String(o.id)}
          contentContainerStyle={[
            s.list,
            { paddingBottom: bottomPad + 80 },
            isDesktop && { maxWidth: 900, alignSelf: 'center', width: '100%' },
          ]}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={[s.emptyIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="package" size={28} color={colors.mutedForeground} />
              </View>
              <Text style={[s.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>
                Your orders will appear here once placed.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              colors={colors}
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: String(item.id) } })}
            />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 20 },
  heroInner: {},
  heroInnerDesktop: { maxWidth: 900, alignSelf: 'center', width: '100%' },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroGreet: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', gap: 4,
  },
  statNum: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_500Medium' },
  list: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  errText: { fontSize: 14, fontFamily: 'Inter_500Medium', marginTop: 8 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  retryText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});
