import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Platform, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPortalOrders } from '@/lib/api';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_STEPS = ['confirmed', 'processing', 'production', 'quality_check', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed', processing: 'Processing', production: 'In Production',
  quality_check: 'Quality Check', shipped: 'Shipped', delivered: 'Delivered',
};
const STATUS_HINTS: Record<string, string> = {
  confirmed:    'Your order has been confirmed and is awaiting processing.',
  processing:   'We are preparing your order for production.',
  production:   'Your boxes are currently being manufactured.',
  quality_check:'Our team is inspecting your order for quality.',
  shipped:      'Your order is on its way to you.',
  delivered:    'Your order has been successfully delivered.',
};
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#3B82F6', processing: '#F59E0B', production: '#F97316',
  quality_check: '#8B5CF6', shipped: '#06B6D4', delivered: '#22C55E', cancelled: '#EF4444',
};
const CURRENCY_SYMS: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', PKR: '₨', AED: 'د.إ' };

// ─── FullTimeline ────────────────────────────────────────────────────────────

function FullTimeline({ status, colors }: { status: string; colors: any }) {
  if (status === 'cancelled') {
    return (
      <View style={[ft.cancelBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
        <Feather name="x-circle" size={16} color="#EF4444" />
        <Text style={ft.cancelText}>This order was cancelled.</Text>
      </View>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);
  const hint = STATUS_HINTS[status] ?? '';

  return (
    <View>
      {/* Hint banner */}
      {!!hint && (
        <View style={[ft.hint, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="info" size={13} color={colors.primary} />
          <Text style={[ft.hintText, { color: colors.primary }]}>{hint}</Text>
        </View>
      )}
      {STATUS_STEPS.map((step, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        const pending = i > currentIdx;
        const last    = i === STATUS_STEPS.length - 1;

        const dotColor = done
          ? '#22C55E'
          : active
          ? STATUS_COLORS[step] ?? colors.primary
          : colors.border;

        return (
          <View key={step} style={ft.stepRow}>
            {/* Left: dot + line */}
            <View style={ft.dotCol}>
              <View style={[
                ft.dot,
                { backgroundColor: pending ? colors.background : dotColor, borderColor: dotColor, borderWidth: done ? 0 : 2 },
                active && ft.dotActive,
              ]}>
                {done   && <Feather name="check" size={12} color="#fff" />}
                {active && <View style={[ft.dotInner, { backgroundColor: dotColor }]} />}
              </View>
              {!last && <View style={[ft.line, { backgroundColor: done ? '#22C55E' : colors.border }]} />}
            </View>

            {/* Right: text */}
            <View style={[ft.textCol, !last && ft.textColPadded]}>
              <Text style={[
                ft.stepLabel,
                { color: pending ? colors.mutedForeground : colors.foreground },
                active && ft.stepLabelActive,
              ]}>
                {STATUS_LABELS[step]}
              </Text>
              {active && (
                <View style={[ft.activePill, { backgroundColor: dotColor + '18', borderColor: dotColor + '40' }]}>
                  <Text style={[ft.activePillText, { color: dotColor }]}>Current Status</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const ft = StyleSheet.create({
  hint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16,
  },
  hintText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dotCol: { alignItems: 'center', width: 28 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  dotActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  dotInner: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, flex: 1, minHeight: 24 },
  textCol: { flex: 1, paddingLeft: 14, paddingBottom: 8, paddingTop: 4 },
  textColPadded: { paddingBottom: 20 },
  stepLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  stepLabelActive: { fontFamily: 'Inter_700Bold' },
  activePill: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start', marginTop: 4,
  },
  activePillText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  cancelBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1,
    borderRadius: 12, padding: 16,
  },
  cancelText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#EF4444' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (!customer) return <Redirect href="/" />;

  const { data: orders, isLoading } = useQuery({
    queryKey: ['portal-orders'],
    queryFn: fetchPortalOrders,
  });

  const order = orders?.find(o => String(o.id) === String(id));
  const sym = CURRENCY_SYMS[order?.currency ?? 'USD'] ?? '$';
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const statusColor = STATUS_COLORS[order?.status ?? ''] ?? '#6B7280';

  if (isLoading) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <Feather name="package" size={40} color={colors.mutedForeground} />
        <Text style={[s.notFoundText, { color: colors.mutedForeground }]}>Order not found.</Text>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          { paddingBottom: bottomPad + 32 },
          isDesktop && { maxWidth: 760, alignSelf: 'center', width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={[s.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[s.heroAccent, { backgroundColor: statusColor }]} />
          <View style={s.heroBody}>
            <View style={s.heroRow}>
              <View>
                <Text style={[s.orderNum, { color: colors.foreground }]}>{order.orderNumber}</Text>
                <Text style={[s.heroDate, { color: colors.mutedForeground }]}>
                  Placed {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <View style={[s.heroBadge, { backgroundColor: statusColor + '18', borderColor: statusColor + '40' }]}>
                <View style={[s.heroBadgeDot, { backgroundColor: statusColor }]} />
                <Text style={[s.heroBadgeText, { color: statusColor }]}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </Text>
              </View>
            </View>

            {/* Meta row */}
            <View style={[s.metaRow, { borderTopColor: colors.border }]}>
              <View style={s.metaItem}>
                <Text style={[s.metaLabel, { color: colors.mutedForeground }]}>Total</Text>
                <Text style={[s.metaValue, { color: colors.primary }]}>{sym}{Number(order.total ?? 0).toFixed(2)}</Text>
              </View>
              {!!order.estimatedDelivery && (
                <View style={s.metaItem}>
                  <Text style={[s.metaLabel, { color: colors.mutedForeground }]}>Est. Delivery</Text>
                  <Text style={[s.metaValue, { color: colors.foreground }]}>{order.estimatedDelivery}</Text>
                </View>
              )}
              <View style={s.metaItem}>
                <Text style={[s.metaLabel, { color: colors.mutedForeground }]}>Items</Text>
                <Text style={[s.metaValue, { color: colors.foreground }]}>{order.items?.length ?? 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tracking */}
        {!!order.trackingNumber && (
          <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>Shipping</Text>
            <View style={s.trackRow}>
              <View style={[s.trackIcon, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="truck" size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={[s.trackLabel, { color: colors.mutedForeground }]}>Tracking Number</Text>
                <Text style={[s.trackNum, { color: '#3B82F6' }]}>{order.trackingNumber}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Progress */}
        <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>Order Progress</Text>
          <View style={s.sectionBody}>
            <FullTimeline status={order.status} colors={colors} />
          </View>
        </View>

        {/* Items */}
        {(order.items ?? []).length > 0 && (
          <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>Order Items</Text>
            {/* Table header */}
            <View style={[s.tableHead, { backgroundColor: colors.muted, borderBottomColor: colors.border }]}>
              <Text style={[s.headCell, { flex: 1, color: colors.mutedForeground }]}>Item</Text>
              <Text style={[s.headCell, { width: 36, color: colors.mutedForeground }]}>Qty</Text>
              <Text style={[s.headCell, { width: 72, textAlign: 'right', color: colors.mutedForeground }]}>Unit</Text>
              <Text style={[s.headCell, { width: 80, textAlign: 'right', color: colors.mutedForeground }]}>Total</Text>
            </View>

            {order.items.map((item, i) => (
              <View key={i} style={[s.itemRow, { borderBottomColor: colors.border }, i === order.items.length - 1 && s.itemRowLast]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.itemName, { color: colors.foreground }]}>{item.name}</Text>
                  {!!item.description && (
                    <Text style={[s.itemDesc, { color: colors.mutedForeground }]}>{item.description}</Text>
                  )}
                </View>
                <Text style={[s.itemCell, { width: 36, color: colors.foreground }]}>{item.qty}</Text>
                <Text style={[s.itemCell, { width: 72, textAlign: 'right', color: colors.foreground }]}>{sym}{Number(item.unitPrice ?? 0).toFixed(2)}</Text>
                <Text style={[s.itemCell, { width: 80, textAlign: 'right', color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>{sym}{Number(item.total ?? 0).toFixed(2)}</Text>
              </View>
            ))}

            <View style={[s.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[s.totalLabel, { color: colors.foreground }]}>Order Total</Text>
              <Text style={[s.totalValue, { color: colors.primary }]}>{sym}{Number(order.total ?? 0).toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  heroCard: {
    borderRadius: 16, borderWidth: 1, marginHorizontal: 16, marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  heroAccent: { height: 5 },
  heroBody: { padding: 16 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNum: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  heroDate: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 3.5 },
  heroBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  metaRow: {
    flexDirection: 'row', marginTop: 14, paddingTop: 14, borderTopWidth: 1, gap: 8,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  metaValue: { fontSize: 16, fontFamily: 'Inter_700Bold', marginTop: 3 },
  section: {
    borderRadius: 16, borderWidth: 1, marginHorizontal: 16, marginTop: 12,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.8,
    textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
  },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  trackIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trackLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  trackNum: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  tableHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  headCell: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  itemRowLast: { borderBottomWidth: 0 },
  itemName: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  itemDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  itemCell: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1,
  },
  totalLabel: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  totalValue: { fontSize: 18, fontFamily: 'Inter_700Bold' },
});
