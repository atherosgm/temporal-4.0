import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabaseClient';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      // Al iniciar sesión, App.js lo detectará automáticamente y te llevará al Dashboard
    } catch (error) {
      Alert.alert("Error de Conexión", "No pudimos conectar con el servidor: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.logoTitle}>TEMPORAL</Text>
      <Text style={styles.subtitle}>Trabajos rápidos, soluciones inmediatas.</Text>
      
      <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>INGRESAR</Text>}
      </TouchableOpacity>
      
      <Text style={styles.footerBranding}>by MontSant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  authContainer: { flex: 1, padding: 40, justifyContent: 'center', backgroundColor: '#FFF' },
  logoTitle: { fontSize: 40, fontWeight: '900', color: '#6366F1', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#64748B', marginBottom: 50 },
  btnPrimary: { backgroundColor: '#6366F1', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  footerBranding: { textAlign: 'center', marginTop: 100, color: '#CBD5E1', fontWeight: 'bold' }
});