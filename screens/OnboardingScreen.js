import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../supabaseClient';

export default function OnboardingScreen({ navigation }) {
  const [form, setForm] = useState({ whatsapp: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.whatsapp || !form.email) return Alert.alert("Error", "Completa todos los campos");
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      whatsapp: form.whatsapp,
      full_name: form.email.split('@')[0],
      updated_at: new Date(),
    });

    setLoading(false);
    if (!error) navigation.navigate('Dashboard');
    else Alert.alert("Error", error.message);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>TEMPORAL</Text>
        <Text style={styles.subtitle}>Configura tu experiencia para comenzar</Text>

        <Text style={styles.label}>🌐 Idioma preferido</Text>
        <TextInput style={styles.input} value="Español" editable={false} />

        <Text style={styles.label}>📍 País de residencia</Text>
        <TextInput style={styles.input} value="Perú (S/ PEN)" editable={false} />

        <Text style={styles.label}>✉️ Correo electrónico</Text>
        <TextInput style={styles.input} placeholder="tu@email.com" onChangeText={t => setForm({...form, email: t})} />

        <Text style={styles.label}>📞 Número de WhatsApp</Text>
        <TextInput style={styles.input} placeholder="+51 999 999 999" keyboardType="phone-pad" onChangeText={t => setForm({...form, whatsapp: t})} />

        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Comenzar a usar Temporal'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, marginTop: 40, elevation: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#6366F1', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#64748B', marginBottom: 30 },
  label: { fontWeight: 'bold', marginBottom: 8, color: '#1E293B' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, marginBottom: 20 },
  btn: { backgroundColor: '#818CF8', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});