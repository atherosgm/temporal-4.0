import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert, ScrollView } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { createClient } from '@supabase/supabase-js';

// CONFIGURACIÓN
Mapbox.setAccessToken('pk.eyJ1IjoidGVtcG9yYWxhcHAiLCJhIjoiY21nbjhzMDYzMDFhdDJrcHU0ODFjeW0xNCJ9.WGoReMaeu5xfNhpI3nmA6Q');
const supabase = createClient('https://xcovsmzfxvtjftztlybg.supabase.co', 'sb_publishable_CSz5kJwV_BMcT9v5uEH0hg_-F6g7a6j');

export default function App() {
  const [role, setRole] = useState('employer'); // employer o worker
  const [userLocation, setUserLocation] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    setupApp();
  }, []);

  async function setupApp() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation([location.coords.longitude, location.coords.latitude]);
    }
    fetchJobs();
  }

  async function fetchJobs() {
    const { data } = await supabase.from('jobs').select('*').eq('status', 'open');
    if (data) setJobs(data);
  }

  const RoleSwitch = () => (
    <TouchableOpacity 
      style={[styles.switchBtn, { backgroundColor: role === 'worker' ? '#10B981' : '#6366F1' }]} 
      onPress={() => setRole(role === 'employer' ? 'worker' : 'employer')}
    >
      <Text style={styles.switchText}>MODO: {role === 'employer' ? 'EMPLEADOR' : 'TRABAJADOR'}</Text>
      <Text style={styles.switchSubText}>Tocar para cambiar</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>Temporal</Text>
          <Text style={styles.greeting}>Hola, Bienvenido</Text>
        </View>
        <RoleSwitch />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* BILLETERA (Wallet) */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Saldo disponible</Text>
          <Text style={styles.walletAmount}>S/ 0.00</Text>
          <TouchableOpacity style={styles.rechargeBtn}>
            <Text style={styles.rechargeText}>+ Recargar Saldo</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENIDO SEGÚN ROL */}
        <View style={{ padding: 20 }}>
          {role === 'employer' ? (
            <View style={styles.mainCard}>
              <Text style={styles.cardTitle}>¿Qué necesitas hoy?</Text>
              <Text style={styles.cardDesc}>Publica una necesidad y recibe ofertas de profesionales cercanos en minutos.</Text>
              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.btnText}>SOLICITAR SERVICIO</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={[styles.mainCard, { borderColor: '#10B981' }]}>
                <Text style={styles.cardTitle}>Mapa de Oportunidades</Text>
                <Text style={styles.cardDesc}>Estás viendo los trabajos disponibles cerca de tu ubicación.</Text>
              </View>

              {/* MAPA REAL DE MAPBOX */}
              <View style={styles.mapContainer}>
                <Mapbox.MapView style={styles.map}>
                  <Mapbox.Camera
                    zoomLevel={14}
                    centerCoordinate={userLocation || [-77.0428, -12.0464]} // Lima por defecto
                    animationMode={'flyTo'}
                  />
                  {userLocation && (
                    <Mapbox.PointAnnotation id="user" coordinate={userLocation}>
                      <View style={styles.userDot} />
                    </Mapbox.PointAnnotation>
                  )}
                </Mapbox.MapView>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { padding: 20, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  logoText: { fontSize: 24, fontWeight: '900', color: '#6366F1' },
  greeting: { fontSize: 12, color: '#64748B' },
  switchBtn: { padding: 8, borderRadius: 12, alignItems: 'center', minWidth: 140 },
  switchText: { color: '#FFF', fontWeight: 'bold', fontSize: 10 },
  switchSubText: { color: '#FFF', fontSize: 8, opacity: 0.8 },
  walletCard: { backgroundColor: '#FFF', margin: 20, padding: 25, borderRadius: 25, elevation: 3, borderBottomWidth: 4, borderBottomColor: '#6366F1' },
  walletLabel: { color: '#64748B', fontSize: 12 },
  walletAmount: { fontSize: 32, fontWeight: '900', color: '#1E293B', marginVertical: 8 },
  rechargeBtn: { backgroundColor: '#F0F2FF', padding: 10, borderRadius: 10, alignSelf: 'flex-start' },
  rechargeText: { color: '#6366F1', fontWeight: 'bold', fontSize: 12 },
  mainCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  cardDesc: { color: '#64748B', lineHeight: 20, marginBottom: 20 },
  primaryBtn: { backgroundColor: '#6366F1', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  mapContainer: { height: 300, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  map: { flex: 1 },
  userDot: { width: 20, height: 20, backgroundColor: '#3B82F6', borderRadius: 10, borderWidth: 3, borderColor: '#FFF' }
});