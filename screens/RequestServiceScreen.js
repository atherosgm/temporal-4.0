import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabaseClient';

export default function RequestServiceScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '' });

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price) {
      return Alert.alert("Campos incompletos", "Por favor llena los campos obligatorios.");
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('jobs').insert({
      client_id: user.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      status: 'open',
      created_at: new Date()
    });

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("¡Éxito!", "Tu solicitud ha sido publicada.");
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitar Servicio</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Título del trabajo *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Plomero Urgente" 
          onChangeText={(t) => setForm({...form, title: t})}
        />

        <Text style={styles.label}>Descripción detallada *</Text>
        <TextInput 
          style={[styles.input, {height: 100}]} 
          multiline 
          placeholder="Explica qué necesitas con detalle..." 
          onChangeText={(t) => setForm({...form, description: t})}
        />

        <Text style={styles.label}>Presupuesto (S/ PEN) *</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          placeholder="Ej: 50" 
          onChangeText={(t) => setForm({...form, price: t})}
        />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Publicar Solicitud</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 25, elevation: 3 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15 },
  btn: { backgroundColor: '#6366F1', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});