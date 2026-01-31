import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../supabaseClient';

export default function DashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletModal, setWalletModal] = useState(false);

  useEffect(() => {
    initDashboard();
  }, []);

  async function initDashboard() {
    setLoading(true);
    await fetchProfile();
    await requestLocationAndJobs();
    setLoading(false);
  }

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }
  }

  async function requestLocationAndJobs() {
    setRefreshing(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Necesitamos tu ubicación para mostrar trabajos cerca.");
      setRefreshing(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    
    // Llamada a la función RPC que debes tener en Supabase
    const { data, error } = await supabase.rpc('get_jobs_by_distance', {
      user_lat: location.coords.latitude, 
      user_lng: location.coords.longitude
    });

    if (data) setNearbyJobs(data);
    setRefreshing(false);
  }

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#6366F1" /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{profile?.full_name || 'Usuario Temporal'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Onboarding')}>
           <Text style={styles.verifyLink}>{profile?.is_verified ? '🛡️ Verificado' : '⚠️ Sin Verificar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Tarjeta de Billetera */}
        <TouchableOpacity style={styles.walletCard} onPress={() => setWalletModal(true)}>
          <Text style={{color: '#FFF', opacity: 0.8}}>Saldo Disponible</Text>
          <Text style={styles.walletAmount}>S/ {profile?.wallet_balance?.toFixed(2) || '0.00'}</Text>
          <Text style={{color: '#FFF', fontSize: 10, marginTop: 10}}>Ver historial de transacciones ➔</Text>
        </TouchableOpacity>

        <View style={styles.padding20}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trabajos Cerca</Text>
            <TouchableOpacity onPress={requestLocationAndJobs}>
                <Text style={{color: '#6366F1'}}>{refreshing ? 'Cargando...' : '🔄 Actualizar'}</Text>
            </TouchableOpacity>
          </View>

          {nearbyJobs.length === 0 ? (
            <Text style={styles.emptyText}>No hay trabajos disponibles cerca de ti en este momento.</Text>
          ) : (
            nearbyJobs.map((job) => (
              <TouchableOpacity key={job.id} style={styles.jobCard}>
                <View style={{flex: 1}}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobDistance}>📍 A {job.distancia_km?.toFixed(1) || 0} km</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.jobPrice}>S/ {job.price}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Accesos rápidos */}
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Acciones rápidas</Text>
          <View style={styles.grid}>
             <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('RequestService')}>
                <Text style={styles.gridIcon}>🔍</Text>
                <Text style={styles.gridText}>Pedir Servicio</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.gridItem, {backgroundColor: '#10B981'}]} onPress={() => navigation.navigate('CreateProfile')}>
                <Text style={styles.gridIcon}>🛠️</Text>
                <Text style={[styles.gridText, {color: '#FFF'}]}>Trabajar</Text>
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Billetera */}
      <Modal visible={walletModal} animationType="slide">
        <SafeAreaView style={{flex: 1, padding: 20}}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mi Billetera</Text>
            <TouchableOpacity onPress={() => setWalletModal(false)}><Text style={{fontSize: 20}}>✕</Text></TouchableOpacity>
          </View>
          <Text style={{textAlign: 'center', marginTop: 50, color: '#94A3B8'}}>Próximamente: Historial detallado de transacciones.</Text>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  verifyLink: { color: '#6366F1', fontWeight: 'bold', fontSize: 12 },
  walletCard: { backgroundColor: '#6366F1', margin: 20, padding: 30, borderRadius: 30, elevation: 5 },
  walletAmount: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  padding20: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  jobCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  jobTitle: { fontWeight: 'bold', fontSize: 16 },
  jobDistance: { color: '#6366F1', fontSize: 12, marginTop: 4 },
  priceContainer: { backgroundColor: '#F0FDF4', padding: 10, borderRadius: 12 },
  jobPrice: { fontWeight: '900', color: '#10B981' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20 },
  grid: { flexDirection: 'row', gap: 15 },
  gridItem: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
  gridIcon: { fontSize: 24 },
  gridText: { fontWeight: 'bold', marginTop: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold' }
});