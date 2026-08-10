import React, { useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Platform, RefreshControl, useWindowDimensions, TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPortalInvoices, Invoice } from '@/lib/api';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  draft:     'Draft',
  sent:      'Sent',
  paid:      'Paid',
  overdue:   'Overdue',
  cancelled: 'Cancelled',
};
const STATUS_COLOR: Record<string, string> = {
  draft:     '#6B7280',
  sent:      '#3B82F6',
  paid:      '#22C55E',
  overdue:   '#EF4444',
  cancelled: '#9CA3AF',
};
const STATUS_BG: Record<string, string> = {
  draft:     '#F9FAFB',
  sent:      '#EFF6FF',
  paid:      '#F0FDF4',
  overdue:   '#FEF2F2',
  cancelled: '#F3F4F6',
};

// ─── InvoiceCard ─────────────────────────────────────────────────────────────

function InvoiceCard({ invoice, colors }: { invoice: Invoice; colors: any }) {
  const statusColor = STATUS_COLOR[invoice.status] ?? '#6B7280';
  const statusBg    = STATUS_BG[invoice.status]    ?? '#F9FAFB';
  const statusLabel = STATUS_LABEL[invoice.status] ?? invoice.status;
  const isWeb = Platform.OS === 'web';

  const formattedDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const formattedDue = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  const formattedSent = invoice.sentAt
    ? new Date(invoice.sentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, ...(isWeb ? { maxWidth: 700, alignSelf: 'center' as const, width: '100%' } : {}) }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.invoiceNumber, { color: colors.foreground }]}>{invoice.invoiceNumber}</Text>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>Issued: {formattedDate}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Total */}
      <View style={styles.totalRow}>
        <Feather name="credit-card" size={16} color={colors.mutedForeground} />
        <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total:</Text>
        <Text style={[styles.totalAmount, { color: colors.foreground }]}>
          {invoice.currency ?? 'GBP'} {Number(invoice.total ?? 0).toFixed(2)}
        </Text>
      </View>

      {/* Due / Paid */}
      {formattedDue && (
        <View style={styles.infoRow}>
          <Feather name="calendar" size={14} color={invoice.status === 'overdue' ? '#EF4444' : colors.mutedForeground} />
          <Text style={[styles.infoText, { color: invoice.status === 'overdue' ? '#EF4444' : colors.mutedForeground }]}>
            Due: {formattedDue}
          </Text>
        </View>
      )}
      {formattedSent && (
        <View style={styles.infoRow}>
          <Feather name="send" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>Sent: {formattedSent}</Text>
        </View>
      )}

      {/* Linked order */}
      {invoice.orderId && (
        <View style={styles.infoRow}>
          <Feather name="package" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Linked order: #{invoice.orderId}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function InvoicesScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { customer, isLoading: authLoading } = useAuth();
  const isWeb = Platform.OS === 'web';

  const { data: invoices, isLoading, error, refetch, isFetching } = useQuery<Invoice[]>({
    queryKey: ['portal', 'invoices'],
    queryFn:  fetchPortalInvoices,
    enabled:  !!customer,
    staleTime: 60_000,
  });

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  if (authLoading) return null;
  if (!customer)   return <Redirect href="/" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Invoices</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {invoices?.length ?? 0} invoice{invoices?.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading invoices…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Feather name="alert-circle" size={40} color="#EF4444" />
          <Text style={[styles.errorText, { color: colors.foreground }]}>Failed to load invoices</Text>
          <TouchableOpacity onPress={onRefresh} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !invoices?.length ? (
        <View style={styles.centered}>
          <Feather name="file-text" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No invoices yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Your invoices will appear here once orders are processed.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100, paddingHorizontal: isWeb ? Math.max(16, (width - 700) / 2) : 16 }]}
          renderItem={({ item }) => <InvoiceCard invoice={item} colors={colors} />}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={colors.primary} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle:  { fontSize: 24, fontFamily: 'Inter_700Bold' },
  headerSub:    { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 2 },
  list:         { paddingTop: 16 },
  card:         { borderRadius: 12, borderWidth: 1, padding: 16 },
  cardHeader:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  invoiceNumber:{ fontSize: 16, fontFamily: 'Inter_700Bold' },
  dateText:     { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:   { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  totalRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  totalLabel:   { fontSize: 14, fontFamily: 'Inter_400Regular' },
  totalAmount:  { fontSize: 16, fontFamily: 'Inter_700Bold' },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText:     { fontSize: 13, fontFamily: 'Inter_400Regular' },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  loadingText:  { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 8 },
  errorText:    { fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  retryBtn:     { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  emptyTitle:   { fontSize: 18, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyText:    { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', opacity: 0.7 },
});
