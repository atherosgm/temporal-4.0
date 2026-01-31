import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function CreateProfileScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Perfil Profesional</Text>
      <Text style={styles.subtitle}>Comparte tu experiencia - cada detalle cuenta</Text>

      <View style={styles.card}>
        <View style={styles.photoPlaceholder}>
          <Text style={{fontSize: 40}}>👤</Text>
          <Text style={{color: '#6366F1', fontWeight: 'bold'}}>Subir foto</Text>
        </View>

        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput style={styles.input} placeholder="Tu nombre" />

        <Text style={styles.label}>Tu especialidad principal *</Text>
        <TextInput style={styles.input} placeholder="Ej: Plomero, Electricista" />

        <Text style={styles.label}>Tarifa por hora (S/) *</Text>
        <TextInput style={styles.input} keyboardType="numeric" placeholder="25" />

        <Text style={styles.label}>Tu Experiencia</Text>
        <TextInput 
          style={[styles.input, {height: 80}]} 
          multiline 
          placeholder="Cuéntanos sobre ti y tus habilidades..." 
        />

        <TouchableOpacity style={[styles.mainBtn, {backgroundColor: '#10B981'}]}>
          <Text style={styles.btnText}>Crear Mi Perfil Profesional</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },
  subtitle: { color: '#64748B', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20 },
  photoPlaceholder: { alignItems: 'center', marginBottom: 20, padding: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12 },
  mainBtn: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});