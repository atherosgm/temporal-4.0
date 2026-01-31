import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

export default function OnboardingScreen({ navigation }) {
  const { colors, t } = useSettings();
  const [name, setName] = useState('');

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user.id, full_name: name });
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 30 }}>
        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding_title')}</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
          placeholder={t('name')} 
          placeholderTextColor={colors.textMuted}
          onChangeText={setName}
        />
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={save}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('save')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  btn: { padding: 20, borderRadius: 12, alignItems: 'center' }
});