import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';
import { decode } from 'base64-arraybuffer';

export default function CreateProfileScreen({ navigation }) {
  const { colors, t } = useSettings();
  const [form, setForm] = useState({ name: '', spec: '', img: null });

  const pick = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5 });
    if (!res.canceled) {
      const { data: { user } } = await supabase.auth.getUser();
      const path = `avatars/${user.id}.jpg`;
      await supabase.storage.from('avatars').upload(path, decode(res.assets[0].base64), { upsert: true, contentType: 'image/jpeg' });
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setForm({ ...form, img: data.publicUrl });
    }
  };

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ full_name: form.name, specialty: form.spec, avatar_url: form.img }).eq('id', user.id);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ padding: 20 }}>
        <Text style={[styles.title, { color: colors.text }]}>{t('profile_title')}</Text>
        <TouchableOpacity onPress={pick} style={[styles.avatar, { backgroundColor: colors.inputBg }]}>
          {form.img ? <Image source={{ uri: form.img }} style={{ width: 100, height: 100 }} /> : <Text>📸</Text>}
        </TouchableOpacity>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
          placeholder={t('name')} 
          placeholderTextColor={colors.textMuted}
          onChangeText={t => setForm({...form, name: t})}
        />
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
          placeholder={t('specialty')} 
          placeholderTextColor={colors.textMuted}
          onChangeText={t => setForm({...form, spec: t})}
        />
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={save}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 20 },
  input: { padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 15 },
  btn: { padding: 20, borderRadius: 12, alignItems: 'center' }
});