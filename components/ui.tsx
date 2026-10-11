import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { colors, radii } from '@/lib/theme';

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  full,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  const bg =
    variant === 'primary' ? colors.lime : variant === 'danger' ? colors.danger : 'transparent';
  const fg = variant === 'primary' ? colors.ink : variant === 'danger' ? '#fff' : colors.white;
  const border = variant === 'outline' ? colors.line : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, hovered }: any) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderRadius: radii.md,
        paddingVertical: 13,
        paddingHorizontal: 20,
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : hovered ? 1.01 : 1 }],
        alignSelf: full ? 'stretch' : 'auto',
        // smooth feel on web
        transitionDuration: '120ms',
      } as any)}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : icon}
      <Text style={{ color: fg, fontWeight: '700', fontSize: 15, letterSpacing: 0.2 }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'lime' }: { label: string; tone?: 'lime' | 'gold' | 'red' }) {
  const bg = tone === 'lime' ? colors.lime : tone === 'gold' ? colors.gold : colors.danger;
  return (
    <View style={{ backgroundColor: bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: colors.ink, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>{label}</Text>
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.mute, fontSize: 13, marginTop: 4 }}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  secure,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
  secure?: boolean;
}) {
  const { TextInput } = require('react-native');
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.mute, fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mute}
        secureTextEntry={secure}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.line,
          borderWidth: 1,
          borderRadius: radii.md,
          color: colors.white,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 11,
          fontSize: 15,
          minHeight: multiline ? 96 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          outlineStyle: 'none',
        } as any}
      />
    </View>
  );
}
