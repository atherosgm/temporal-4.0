import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../supabaseClient';

export default function DashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{profile?.full_name || 'Usuario Temporal'}</Text>
        <Text style={styles.statusBadge}>⚠️ Sin Verificar</Text>
      </View>

      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 20}}>
        <View style={styles.walletCard}>
          <Text style={{color: '#FFF', opacity: 0.8}}>Saldo Disponible</Text>
          <Text style={styles.walletAmount}>S/ {profile?.wallet_balance?.toFixed(2) || '0.00'}</Text>
          <Text style={{color: '#FFF', fontSize: 10, marginTop: 10}}>Ver historial de transacciones ➔</Text>
        </View>

        <Text style={styles.sectionTitle}>¿Qué quieres hacer hoy?</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('RequestService')}>
            <Text style={{fontSize: 24}}>🔍</Text>
            <Text style={styles.actionText}>Pedir un Servicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#10B981'}]} onPress={() => navigation.navigate('CreateProfile')}>
            <Text style={{fontSize: 24}}>🛠️</Text>
            <Text style={[styles.actionText, {color: '#FFF'}]}>Trabajar (Perfil)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
           <Text style={{fontWeight: 'bold', marginBottom: 5}}>Seguridad y Confianza</Text>
           <Text style={{color: '#64748B', fontSize: 12}}>Estatus: Vulnerable. Haz clic para gestionar tu identidad.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF' },
  userName: { fontSize: 20, fontWeight: 'bold' },
  statusBadge: { color: '#F59E0B', fontWeight: 'bold', fontSize: 12 },
  walletCard: { backgroundColor: '#6366F1', padding: 30, borderRadius: 30, marginBottom: 25 },
  walletAmount: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  actionGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  actionBtn: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
  actionText: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  infoBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' }
});