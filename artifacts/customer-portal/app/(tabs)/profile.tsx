import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Alert, useWindowDimensions,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customer, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (!customer) return <Redirect href="/" />;

  const initials = (customer.name ?? '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const topPad    = Platform.OS === 'web' ? 0 : insets.top;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          await logout();
        },
      },
    ]);
  };

  const infoRows: Array<{ icon: keyof typeof Feather.glyphMap; label: string; value: string }> = [
    { icon: 'user',      label: 'Full Name',        value: customer.name },
    { icon: 'hash',      label: 'Customer Number',  value: customer.customerNumber },
    { icon: 'mail',      label: 'Email',            value: customer.email },
    { icon: 'phone',     label: 'Phone',            value: customer.phone ?? 'Not provided' },
    { icon: 'briefcase', label: 'Company',          value: customer.company ?? 'Not provided' },
    {
      icon: 'calendar', label: 'Member Since', value: customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '—',
    },
  ];

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: colors.primary, paddingTop: topPad + (isDesktop ? 20 : 16) }]}>
          <View style={[s.heroInner, isDesktop && s.heroInnerDesktop]}>
            <View style={[s.avatarRing, { backgroundColor: colors.accent }]}>
              <Text style={[s.avatarText, { color: colors.primary }]}>{initials}</Text>
            </View>
            <Text style={s.name}>{customer.name}</Text>
            <View style={s.verifiedBadge}>
              <Feather name="check-circle" size={11} color="#86EFAC" />
              <Text style={s.verifiedText}>Verified Customer</Text>
            </View>
            <Text style={[s.custNum, { color: 'rgba(255,255,255,0.5)' }]}>
              #{customer.customerNumber}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={isDesktop ? s.contentDesktop : undefined}>
          {/* Account Info */}
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.mutedForeground }]}>Account Information</Text>
            {infoRows.map((row, i) => (
              <View key={row.label} style={[
                s.row,
                { borderTopColor: colors.border },
                i === 0 && s.rowFirst,
              ]}>
                <View style={[s.iconBox, { backgroundColor: colors.secondary }]}>
                  <Feather name={row.icon} size={15} color={colors.primary} />
                </View>
                <View style={s.rowContent}>
                  <Text style={[s.rowLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                  <Text style={[s.rowValue, { color: colors.foreground }]} numberOfLines={1}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Support */}
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.mutedForeground }]}>Support</Text>
            <View style={[s.row, s.rowFirst, { borderTopColor: colors.border }]}>
              <View style={[s.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="mail" size={15} color="#3B82F6" />
              </View>
              <View style={s.rowContent}>
                <Text style={[s.rowLabel, { color: colors.mutedForeground }]}>Email</Text>
                <Text style={[s.rowValue, { color: '#3B82F6' }]}>help@primepackagingboxes.com</Text>
              </View>
            </View>
            <View style={[s.row, { borderTopColor: colors.border }]}>
              <View style={[s.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="phone" size={15} color="#22C55E" />
              </View>
              <View style={s.rowContent}>
                <Text style={[s.rowLabel, { color: colors.mutedForeground }]}>Phone</Text>
                <Text style={[s.rowValue, { color: colors.foreground }]}>+1 (800) PRIME-BOX</Text>
              </View>
            </View>
          </View>

          {/* Sign out */}
          <TouchableOpacity
            style={[s.signOutBtn, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={16} color="#EF4444" />
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={[s.version, { color: colors.mutedForeground }]}>Prime Portal v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  hero: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 28 },
  heroInner: { alignItems: 'center', width: '100%' },
  heroInnerDesktop: { maxWidth: 700, alignSelf: 'center' },
  avatarRing: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  avatarText: { fontSize: 30, fontFamily: 'Inter_700Bold' },
  name: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', marginBottom: 6 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(34,197,94,0.18)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.35)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8,
  },
  verifiedText: { fontSize: 11, color: '#86EFAC', fontFamily: 'Inter_600SemiBold' },
  custNum: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  contentDesktop: { maxWidth: 700, alignSelf: 'center', width: '100%' },
  card: {
    borderRadius: 16, marginHorizontal: 16, marginTop: 16,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.8,
    textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1 },
  rowFirst: { borderTopWidth: 0 },
  iconBox: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  rowValue: { fontSize: 14, fontFamily: 'Inter_500Medium', marginTop: 2 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1,
  },
  signOutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#EF4444' },
  version: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 16 },
});
