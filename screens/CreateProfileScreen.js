import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, 
  SafeAreaView, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';
import { decode } from 'base64-arraybuffer';

export default function CreateProfileScreen({ navigation }) {
  const { colors, t } = useSettings();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', spec: '', img: null, portfolio: [], avg_rating: 0, total_reviews: 0 
  });

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setForm({ 
        name: data.full_name || '', 
        spec: data.specialty || '', 
        img: data.avatar_url, 
        portfolio: data.portfolio_urls || [],
        avg_rating: data.avg_rating || 0,
        total_reviews: data.total_reviews || 0
      });
    }
  }

  const pickPortfolioImage = async () => {
    if (form.portfolio.length >= 5) return Alert.alert("Límite", "Máximo 5 fotos.");
    let res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5 });
    if (!res.canceled) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const path = `portfolio/${user.id}/${Date.now()}.jpg`;
        await supabase.storage.from('avatars').upload(path, decode(res.assets[0].base64), { contentType: 'image/jpeg' });
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        const newPortfolio = [...form.portfolio, data.publicUrl];
        await supabase.from('profiles').update({ portfolio_urls: newPortfolio }).eq('id', user.id);
        setForm({ ...form, portfolio: newPortfolio });
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    }
  };

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ 
      full_name: form.name, specialty: form.spec, avatar_url: form.img, role: 'worker' 
    }).eq('id', user.id);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { color: colors.success }]}>{t('profile_title')}</Text>
        
        {/* REPUTACIÓN VISIBLE */}
        <View style={styles.reputationCard}>
          <Text style={{ fontSize: 24, color: '#FBBF24', fontWeight: 'bold' }}>★ {form.avg_rating.toFixed(1)}</Text>
          <Text style={{ color: colors.textMuted }}>{form.total_reviews} {t('reseñas')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('name')}</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
            value={form.name} onChangeText={t => setForm({...form, name: t})} 
          />

          <Text style={[styles.label, { color: colors.text }]}>{t('specialty')}</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
            value={form.spec} onChangeText={t => setForm({...form, spec: t})} 
          />

          {/* PORTAFOLIO DE TRABAJOS REALIZADOS */}
          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>🖼️ Portafolio de Trabajos</Text>
          <ScrollView horizontal style={{ marginVertical: 10 }}>
            {form.portfolio.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.portfolioImg} />
            ))}
            <TouchableOpacity onPress={pickPortfolioImage} style={[styles.addBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              {loading ? <ActivityIndicator size="small" /> : <Text style={{ fontSize: 30, color: colors.textMuted }}>+</Text>}
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={save}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  reputationCard: { alignItems: 'center', marginBottom: 20 },
  card: { padding: 25, borderRadius: 25, borderWidth: 1 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: { padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 15 },
  portfolioImg: { width: 90, height: 90, borderRadius: 12, marginRight: 10 },
  addBtn: { width: 90, height: 90, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  btn: { padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20 },
});