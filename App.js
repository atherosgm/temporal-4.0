import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator, Modal, Linking, StatusBar } from 'react-native';
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
  const [verificationModal, setVerificationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => { setIsReady(true); }, 2000);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
  }, []);

  async function fetchProfile(id) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (data) {
      setProfile(data);
      setStep('dashboard');
    } else {
      setStep('profile');
    }
  }

  // --- LÓGICA DE VERIFICACIÓN ---
  const handleApplyVerification = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', session.user.id);
    if (!error) {
      Alert.alert("Solicitud Enviada", "Estamos revisando tus datos. Te contactaremos pronto por correo.");
      fetchProfile(session.user.id);
      setVerificationModal(false);
    }
    setLoading(false);
  };

  // --- SPLASH SCREEN ---
  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashLogoCircle}><Text style={styles.splashLogoText}>T</Text></View>
        <Text style={styles.splashBrand}>TEMPORAL</Text>
        <Text style={styles.byMontSant}>by MontSant</Text>
      </View>
    );
  }

  // --- AUTH (SIMPLIFICADO PARA TESTEO) ---
  if (step === 'auth' && !session) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.logoTitle}>TEMPORAL</Text>
        <Text style={styles.authSubtitle}>Conectando el trabajo con la necesidad</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => Alert.alert("Login", "Usa tu flujo de Supabase para entrar")}>
          <Text style={styles.btnText}>INGRESAR</Text>
        </TouchableOpacity>
        <Text style={styles.footerBranding}>by MontSant</Text>
      </View>
    );
  }

  // --- DASHBOARD ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.userInfoRow}>
          <Text style={styles.userName}>{profile?.full_name || 'Usuario'}</Text>
          {profile?.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setVerificationModal(true)}>
          <Text style={styles.verifyLink}>{profile?.is_verified ? '🛡️ Protegido' : '⚠️ Verificar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.walletCard}>
          <Text style={{color: '#FFF', opacity: 0.8}}>Mi Billetera</Text>
          <Text style={styles.walletAmount}>S/ {profile?.wallet_balance?.toFixed(2) || '0.00'}</Text>
        </View>

        <View style={styles.padding20}>
          <Text style={styles.sectionTitle}>Estatus de Seguridad</Text>
          
          <TouchableOpacity style={styles.verificationCard} onPress={() => setVerificationModal(true)}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 30, marginRight: 15}}>{profile?.is_verified ? '✅' : '🔒'}</Text>
                <View>
                   <Text style={styles.vTitle}>Perfil {profile?.is_verified ? 'Verificado' : 'No Verificado'}</Text>
                   <Text style={styles.vSubTitle}>
                     {profile?.verification_status === 'pending' ? 'Solicitud en revisión' : 'Haz clic para ver requisitos'}
                   </Text>
                </View>
             </View>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('mailto:temporalappii@gmail.com')}>
            <Text style={styles.menuText}>📩 Soporte Técnico</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL CENTRO DE VERIFICACIÓN */}
      <Modal visible={verificationModal} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Centro de Verificación</Text>
            <Text style={styles.faqA}>Para obtener el Check Azul de **Temporal**, debes cumplir con:</Text>
            
            <View style={styles.reqRow}><Text style={styles.reqIcon}>✓</Text><Text>Foto de DNI legible</Text></View>
            <View style={styles.reqRow}><Text style={styles.reqIcon}>✓</Text><Text>Antecedentes penales limpios</Text></View>
            <View style={styles.reqRow}><Text style={styles.reqIcon}>✓</Text><Text>Foto de perfil real</Text></View>

            <View style={styles.infoBox}>
               <Text style={styles.infoText}>
                 Un perfil verificado genera **3 veces más confianza** y permite acceder a trabajos de mayor presupuesto.
               </Text>
            </View>

            {profile?.verification_status === 'not_started' && (
              <TouchableOpacity style={styles.btnPrimary} onPress={handleApplyVerification} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SOLICITAR VERIFICACIÓN</Text>}
              </TouchableOpacity>
            )}

            {profile?.verification_status === 'pending' && (
              <View style={[styles.btnPrimary, {backgroundColor: '#E2E8F0'}]}>
                <Text style={{color: '#64748B', fontWeight: 'bold'}}>EN REVISIÓN...</Text>
              </View>
            )}

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
  splashLogoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  splashLogoText: { color: '#FFF', fontSize: 50, fontWeight: '900' },
  splashBrand: { fontSize: 32, fontWeight: '900', color: '#1E293B', marginTop: 20 },
  byMontSant: { position: 'absolute', bottom: 50, fontSize: 16, color: '#94A3B8' },
  authContainer: { flex: 1, padding: 40, justifyContent: 'center', backgroundColor: '#FFF' },
  logoTitle: { fontSize: 40, fontWeight: '900', color: '#6366F1', textAlign: 'center' },
  authSubtitle: { textAlign: 'center', color: '#64748B', marginBottom: 50 },
  header: { padding: 20, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  verifiedBadge: { backgroundColor: '#3B82F6', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  verifiedText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  verifyLink: { color: '#6366F1', fontWeight: 'bold', fontSize: 12 },
  walletCard: { backgroundColor: '#6366F1', margin: 20, padding: 30, borderRadius: 30, elevation: 10 },
  walletAmount: { color: '#FFF', fontSize: 36, fontWeight: '900', marginTop: 10 },
  padding20: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1E293B' },
  verificationCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  vTitle: { fontWeight: 'bold', fontSize: 16 },
  vSubTitle: { color: '#64748B', fontSize: 12 },
  menuItem: { backgroundColor: '#FFF', padding: 18, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  menuText: { fontWeight: 'bold', color: '#1E293B' },
  btnPrimary: { backgroundColor: '#6366F1', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 30, padding: 30 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  faqA: { color: '#64748B', marginBottom: 20 },
  reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reqIcon: { color: '#10B981', fontWeight: 'bold', marginRight: 10 },
  infoBox: { backgroundColor: '#EFF6FF', padding: 15, borderRadius: 15, marginTop: 10 },
  infoText: { color: '#1E40AF', fontSize: 13, lineHeight: 18 },
  btnCancel: { marginTop: 15, alignItems: 'center' },
  footerBranding: { textAlign: 'center', marginTop: 100, color: '#CBD5E1' }
});