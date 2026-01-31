import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator, Modal, Linking, StatusBar, FlatList } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN ---
Mapbox.setAccessToken('pk.eyJ1IjoidGVtcG9yYWxhcHAiLCJhIjoiY21nbjhzMDYzMDFhdDJrcHU0ODFjeW0xNCJ9.WGoReMaeu5xfNhpI3nmA6Q');
const supabase = createClient('https://xcovsmzfxvtjftztlybg.supabase.co', 'sb_publishable_CSz5kJwV_BMcT9v5uEH0hg_-F6g7a6j');

export default function App() {
  const [isReady, setIsReady] = useState(false); 
  const [step, setStep] = useState('auth'); 
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Modales
  const [verificationModal, setVerificationModal] = useState(false);
  const [walletModal, setWalletModal] = useState(false);

  // Estados de Datos
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);

  useEffect(() => {
    setTimeout(() => { setIsReady(true); }, 2000);
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
        await requestLocationAndJobs();
        await fetchWalletHistory(session.user.id);
      }
    };
    initApp();
  }, []);

  async function fetchProfile(id) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) { setProfile(data); setStep('dashboard'); } else { setStep('profile'); }
  }

  // --- PUNTO B: ALGORITMO DE CERCANÍA ---
  async function requestLocationAndJobs() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    let location = await Location.getCurrentPositionAsync({});
    const { data } = await supabase.rpc('get_jobs_by_distance', {
      user_lat: location.coords.latitude, user_lng: location.coords.longitude
    });
    if (data) setNearbyJobs(data);
  }

  // --- PUNTO D: HISTORIAL DETALLADO ---
  async function fetchWalletHistory(id) {
    const { data } = await supabase.from('wallet_history').select('*').eq('profile_id', id).order('created_at', { ascending: false });
    if (data) setWalletHistory(data);
  }

  // --- PUNTO C: CALIFICACIONES (LOGICA) ---
  const handleRate = async (rating) => {
    Alert.alert("Calificación", `Has calificado con ${rating} estrellas.`);
    // Aquí iría el insert a la tabla reviews
  };

  const handleApplyVerification = async () => {
    setLoading(true);
    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', session.user.id);
    fetchProfile(session.user.id);
    setVerificationModal(false);
    setLoading(false);
  };

  if (!isReady) return (
    <View style={styles.splashContainer}>
      <View style={styles.splashLogoCircle}><Text style={styles.splashLogoText}>T</Text></View>
      <Text style={styles.splashBrand}>TEMPORAL</Text>
      <Text style={styles.byMontSant}>by MontSant</Text>
    </View>
  );

  if (step === 'auth' && !session) return (
    <View style={styles.authContainer}>
      <Text style={styles.logoTitle}>TEMPORAL</Text>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => Alert.alert("Login", "Usa tu flujo de Supabase")}>
        <Text style={styles.btnText}>INGRESAR</Text>
      </TouchableOpacity>
      <Text style={styles.footerBranding}>by MontSant</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfoRow}>
          <Text style={styles.userName}>{profile?.full_name || 'Usuario'}</Text>
          {profile?.is_verified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓</Text></View>}
        </View>
        <TouchableOpacity onPress={() => setVerificationModal(true)}>
          <Text style={styles.verifyLink}>{profile?.is_verified ? '🛡️ Verificado' : '⚠️ Sin Verificar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* BILLETERA (RESUMEN) */}
        <TouchableOpacity style={styles.walletCard} onPress={() => setWalletModal(true)}>
          <Text style={{color: '#FFF', opacity: 0.8}}>Saldo Disponible</Text>
          <Text style={styles.walletAmount}>S/ {profile?.wallet_balance?.toFixed(2) || '0.00'}</Text>
          <Text style={{color: '#FFF', fontSize: 10, marginTop: 10}}>Ver historial de transacciones ➔</Text>
        </TouchableOpacity>

        <View style={styles.padding20}>
          {/* LISTA DE TRABAJOS CERCANOS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trabajos Cerca (InDriver Style)</Text>
            <TouchableOpacity onPress={requestLocationAndJobs}><Text style={{color: '#6366F1'}}>🔄</Text></TouchableOpacity>
          </View>

          {nearbyJobs.map((job) => (
            <TouchableOpacity key={job.id} style={styles.jobCard}>
              <View style={{flex: 1}}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                {/* PUNTO C: SISTEMA DE ESTRELLAS */}
                <View style={{flexDirection: 'row', marginTop: 4}}>
                  {[1,2,3,4,5].map(s => <Text key={s} style={{color: '#FBBF24', fontSize: 12}}>★</Text>)}
                  <Text style={{fontSize: 10, color: '#94A3B8', marginLeft: 5}}>(4.8)</Text>
                </View>
                <Text style={styles.jobDistance}>📍 A {job.distancia_km.toFixed(1)} km de ti</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.jobPrice}>S/ {job.price}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* PUNTO A: SEGURIDAD */}
          <Text style={styles.sectionTitle}>Seguridad y Confianza</Text>
          <TouchableOpacity style={styles.verificationCard} onPress={() => setVerificationModal(true)}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 30, marginRight: 15}}>{profile?.is_verified ? '✅' : '🔒'}</Text>
                <View>
                   <Text style={styles.vTitle}>Estatus: {profile?.is_verified ? 'Protegido' : 'Vulnerable'}</Text>
                   <Text style={styles.vSubTitle}>Haz clic para gestionar tu identidad</Text>
                </View>
             </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('mailto:temporalappii@gmail.com')}>
            <Text style={styles.menuText}>📩 Soporte Técnico 24/7</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL HISTORIAL (PUNTO D) */}
      <Modal visible={walletModal} animationType="slide">
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Historial de Billetera</Text>
            <TouchableOpacity onPress={() => setWalletModal(false)}><Text style={{fontSize: 20}}>✕</Text></TouchableOpacity>
          </View>
          <FlatList
            data={walletHistory}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <View style={styles.historyRow}>
                <View>
                  <Text style={{fontWeight: 'bold'}}>{item.description}</Text>
                  <Text style={{fontSize: 10, color: '#94A3B8'}}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={{color: item.amount > 0 ? '#10B981' : '#EF4444', fontWeight: 'bold'}}>
                  {item.amount > 0 ? '+' : ''} S/ {item.amount.toFixed(2)}
                </Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50, color: '#94A3B8'}}>No hay movimientos registrados.</Text>}
          />
        </SafeAreaView>
      </Modal>

      {/* MODAL VERIFICACIÓN (PUNTO A) */}
      <Modal visible={verificationModal} animationType="fade" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Centro de Verificación</Text>
            <Text style={styles.infoText}>Para obtener el Check Azul debes subir tu DNI y antecedentes.</Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleApplyVerification} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SOLICITAR VERIFICACIÓN</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={() => setVerificationModal(false)}>
              <Text style={{color: '#64748B'}}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  splashContainer: { flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  splashLogoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  splashLogoText: { color: '#FFF', fontSize: 40, fontWeight: '900' },
  splashBrand: { fontSize: 28, fontWeight: '900', color: '#1E293B', marginTop: 15 },
  byMontSant: { position: 'absolute', bottom: 40, color: '#94A3B8' },
  authContainer: { flex: 1, padding: 40, justifyContent: 'center', backgroundColor: '#FFF' },
  logoTitle: { fontSize: 36, fontWeight: '900', color: '#6366F1', textAlign: 'center', marginBottom: 50 },
  header: { padding: 20, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  verifiedBadge: { backgroundColor: '#3B82F6', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  verifiedText: { color: '#FFF', fontSize: 10 },
  verifyLink: { color: '#6366F1', fontWeight: 'bold', fontSize: 12 },
  walletCard: { backgroundColor: '#6366F1', margin: 20, padding: 30, borderRadius: 30, elevation: 10 },
  walletAmount: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  padding20: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  jobCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  jobTitle: { fontWeight: 'bold', fontSize: 16 },
  jobDistance: { color: '#6366F1', fontSize: 12, marginTop: 4 },
  priceContainer: { backgroundColor: '#F0FDF4', padding: 10, borderRadius: 12 },
  jobPrice: { fontWeight: '900', color: '#10B981' },
  verificationCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  vTitle: { fontWeight: 'bold' },
  vSubTitle: { color: '#64748B', fontSize: 11 },
  menuItem: { backgroundColor: '#FFF', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  menuText: { fontWeight: 'bold' },
  btnPrimary: { backgroundColor: '#6366F1', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 30, padding: 30 },
  modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#EEE' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  historyRow: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  infoText: { color: '#64748B', marginBottom: 20, textAlign: 'center' },
  btnCancel: { marginTop: 15, alignItems: 'center' },
  footerBranding: { textAlign: 'center', marginTop: 50, color: '#CBD5E1' }
});