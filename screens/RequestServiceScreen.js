import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function RequestServiceScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 20}}>
        <Text style={{color: '#6366F1'}}>← Volver</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Solicitar Servicio</Text>
      <Text style={styles.subtitle}>Describe qué necesitas y te conectaremos con el mejor profesional</Text>

      <View style={styles.card}>
        <Text style={styles.label}>¿Qué necesitas? *</Text>
        <TextInput style={styles.input} placeholder="Selecciona el servicio que necesitas" />
        
        <Text style={styles.label}>Explica tu situación *</Text>
        <TextInput 
          style={[styles.input, {height: 100}]} 
          multiline 
          placeholder="Ej: Se tapó la cañería del baño principal..." 
        />
        
        <Text style={styles.label}>Detalles del Trabajo</Text>
        <TextInput style={styles.input} placeholder="Urgencia (Ej: Media)" />
        <TextInput style={styles.input} placeholder="Presupuesto estimado (S/)" keyboardType="numeric" />

        <TouchableOpacity style={styles.mainBtn}>
          <Text style={styles.btnText}>Buscar Profesionales Disponibles</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { color: '#64748B', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12 },
  mainBtn: { backgroundColor: '#6366F1', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});