import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

export default function RequestServiceScreen({ navigation }) {
  const { colors, t } = useSettings();
  const [form, setForm] = useState({ title: '', price: '' });

  const send = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('jobs').insert([{ creator_id: user.id, title: form.title, price: parseFloat(form.price), status: 'open' }]);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ padding: 20 }}>
        <Text style={[styles.title, { color: colors.text }]}>{t('request_title')}</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
          placeholder={t('name')} 
          placeholderTextColor={colors.textMuted}
          onChangeText={t => setForm({...form, title: t})}
        />
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
          placeholder={t('price')} 
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          onChangeText={t => setForm({...form, price: t})}
        />
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={send}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  input: { padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 15 },
  btn: { padding: 20, borderRadius: 12, alignItems: 'center' }
});