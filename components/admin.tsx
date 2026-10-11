import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { colors, radii } from '@/lib/theme';

export function AdminPage({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isDesktop ? 32 : 16, paddingBottom: 80 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <Text style={{ color: colors.white, fontSize: isDesktop ? 26 : 22, fontWeight: '900', letterSpacing: -0.5 }}>{title}</Text>
        {action}
      </View>
      {children}
    </ScrollView>
  );
}

export function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: any) => ({
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: colors.lime, borderRadius: radii.md,
        paddingVertical: 9, paddingHorizontal: 14,
        opacity: pressed ? 0.85 : 1,
      } as any)}
    >
      <Plus size={15} color={colors.ink} />
      <Text style={{ color: colors.ink, fontWeight: '800', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 16 }, style]}>
      {children}
    </View>
  );
}

export function Row({ children, onDelete, onEdit }: { children: React.ReactNode; onDelete?: () => void; onEdit?: () => void }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line,
    }}>
      <Pressable onPress={onEdit} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {children}
      </Pressable>
      {onDelete && (
        <Pressable onPress={onDelete} style={{ padding: 6 }} accessibilityLabel="Delete">
          <Trash2 size={16} color={colors.mute} />
        </Pressable>
      )}
    </View>
  );
}

export function Input({
  label, value, onChange, placeholder, multiline, numeric, style,
}: {
  label?: string; value: string; onChange: (t: string) => void; placeholder?: string;
  multiline?: boolean; numeric?: boolean; style?: any;
}) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label ? (
        <Text style={{ color: colors.mute, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={(t) => onChange(numeric ? t.replace(/[^0-9.]/g, '') : t)}
        placeholder={placeholder}
        placeholderTextColor={colors.mute}
        multiline={multiline}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        style={{
          backgroundColor: colors.pitch, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line,
          color: colors.white, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
          minHeight: multiline ? 80 : undefined, textAlignVertical: multiline ? 'top' : 'center',
          outlineStyle: 'none',
        } as any}
      />
    </View>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: colors.white, fontSize: 14, fontWeight: '600' }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.lime, false: colors.line }} thumbColor="#fff" />
    </Pressable>
  );
}

export function SaveBar({ onSave, saving, saved }: { onSave: () => void; saving: boolean; saved?: boolean }) {
  return (
    <Pressable
      onPress={onSave}
      disabled={saving}
      style={({ pressed }: any) => ({
        marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: colors.lime, borderRadius: radii.md, paddingVertical: 11, paddingHorizontal: 22,
        opacity: saving ? 0.6 : pressed ? 0.85 : 1,
      } as any)}
    >
      {saving && <ActivityIndicator size="small" color={colors.ink} />}
      <Text style={{ color: colors.ink, fontWeight: '800', fontSize: 14 }}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
      </Text>
    </Pressable>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
      <Text style={{ color: colors.mute, fontSize: 14 }}>{text}</Text>
    </View>
  );
}
