import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

export default function RequestServiceScreen({ navigation }) {
  const { colors, t } = useSettings();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', urgency: 'Normal' });

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price || !form.category) {
      return Alert.alert("Campos requeridos", "Por favor completa todos los campos marcados con (*)");
    }

    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let loc = { coords: { latitude: 0, longitude: 0 } };
      if (status === 'granted') {
        loc = await Location.getCurrentPositionAsync({});
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('jobs').insert([{
        creator_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category, // Aquí el usuario pone lo que sea: "Abogado", "Niñera", etc.
        price: parseFloat(form.price),
        urgency: form.urgency,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        status: 'open'
      }]);

      if (error) throw error;
      Alert.alert("¡Publicado!", "Tu necesidad ha sido compartida con los profesionales cercanos.");
      navigation.navigate('Dashboard');
    } catch (e) { Alert.alert("Error", e.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { color: colors.text }]}>¿Qué necesitas hoy?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>No hay límites: desde servicios profesionales hasta ayuda rápida.</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Especialidad requerida *</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
            placeholder="Ej: Zapatero, Doctor, Abogado, Niñera..." 
            placeholderTextColor={colors.textMuted}
            onChangeText={t => setForm({...form, category: t})}
          />

          <Text style={[styles.label, { color: colors.text }]}>Título breve *</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
            placeholder="Ej: Urgencia pediátrica, Reparar taco de zapato..." 
            placeholderTextColor={colors.textMuted}
            onChangeText={t => setForm({...form, title: t})}
          />

          <Text style={[styles.label, { color: colors.text }]}>Descripción detallada *</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border, height: 100 }]} 
            multiline placeholder="Explica exactamente qué necesitas..." 
            placeholderTextColor={colors.textMuted}
            onChangeText={t => setForm({...form, description: t})}
          />

          <Text style={[styles.label, { color: colors.text }]}>Presupuesto sugerido (S/)</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]} 
            keyboardType="numeric" placeholder="50" 
            placeholderTextColor={colors.textMuted}
            onChangeText={t => setForm({...form, price: t})}
          />

          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Publicar Necesidad 📍</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: '900', marginTop: 20 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  card: { padding: 20, borderRadius: 25, borderWidth: 1 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { padding: 15, borderRadius: 12, borderWidth: 1 },
  btn: { padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});