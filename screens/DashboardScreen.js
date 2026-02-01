import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, RefreshControl, ActivityIndicator, Alert 
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

const CATEGORIES = [
  { id: '1', name: 'Todo', icon: '🌍' },
  { id: '2', name: 'Hogar', icon: '🏠' },
  { id: '3', name: 'Salud', icon: '🩺' },
  { id: '4', name: 'Niñeras', icon: '👶' },
  { id: '5', name: 'Técnico', icon: '💻' },
  { id: '6', name: 'Legal', icon: '⚖️' },
  { id: '7', name: 'Oficios', icon: '🔨' },
  { id: '8', name: 'Mascotas', icon: '🐕' },
];

export default function DashboardScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme, language, toggleLanguage, t } = useSettings();
  
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Todo');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchNearbyJobs()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchNearbyJobs()]);
    setRefreshing(false);
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    } catch (e) { console.log(e); }
  }

  async function fetchNearbyJobs() {
    try {
      // 1. Obtener GPS del usuario
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Si no hay GPS, traemos los trabajos normales sin distancia
        const { data } = await supabase.from('jobs').select('*, profiles:creator_id(avg_rating, total_reviews)').eq('status', 'open');
        setJobs(data || []);
        return;
      }
      
      let loc = await Location.getCurrentPositionAsync({});

      // 2. Llamar a la función RPC de Supabase (get_jobs_by_distance)
      const { data, error } = await supabase.rpc('get_jobs_by_distance', {
        user_lat: loc.coords.latitude,
        user_lng: loc.coords.longitude
      });

      if (error) throw error;
      setJobs(data || []);
    } catch (e) {
      console.log("Error cargando trabajos:", e.message);
    }
  }

  const filteredJobs = selectedCat === 'Todo' 
    ? jobs 
    : jobs.filter(j => j.category === selectedCat);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER BAR */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>{t('welcome')}</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{profile?.full_name || 'User'}</Text>
        </View>
        
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={toggleLanguage} style={[styles.controlBtn, { backgroundColor: colors.inputBg }]}>
            <Text style={{ fontWeight: 'bold', color: colors.primary }}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={[styles.controlBtn, { backgroundColor: colors.inputBg }]}>
            <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* WALLET CARD */}
        <View style={[styles.walletCard, { backgroundColor: colors.primary }]}>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>{t('balance')}</Text>
          <Text style={styles.walletAmount}>S/ {profile?.wallet_balance?.toFixed(2) || '0.00'}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 10 }}>{t('history')}</Text>
        </View>

        {/* BARRA DE CATEGORÍAS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.catItem, 
                { backgroundColor: selectedCat === cat.name ? colors.primary : colors.card, borderColor: colors.border }
              ]}
              onPress={() => setSelectedCat(cat.name)}
            >
              <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
              <Text style={{ color: selectedCat === cat.name ? '#FFF' : colors.text, fontSize: 12, fontWeight: 'bold' }}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LISTA DE TRABAJOS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('jobs_title')} ({filteredJobs.length})
          </Text>

          {filteredJobs.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.textMuted }}>{t('no_jobs')}</Text>
            </View>
          ) : (
            filteredJobs.map((job) => (
              <TouchableOpacity 
                key={job.id} 
                style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('JobDetails', { job: job })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                  
                  {/* ESTRELLAS Y DISTANCIA */}
                  <View style={styles.metaRow}>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold' }}>
                       📍 {job.distancia_km ? `${job.distancia_km.toFixed(1)} km` : '---'}
                    </Text>
                    <View style={styles.stars}>
                      {[1,2,3,4,5].map(s => (
                        <Text key={s} style={{ fontSize: 10, color: s <= (job.avg_rating || 0) ? '#FBBF24' : colors.textMuted }}>★</Text>
                      ))}
                    </View>
                  </View>
                  
                  <Text style={[styles.jobDesc, { color: colors.textMuted }]} numberOfLines={1}>
                    {job.category} • {job.description}
                  </Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceValue}>S/ {job.price}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ACCIONES RÁPIDAS */}
        <View style={{ padding: 20, gap: 10 }}>
           <TouchableOpacity 
             style={[styles.mainBtn, { backgroundColor: colors.primary }]} 
             onPress={() => navigation.navigate('RequestService')}
           >
             <Text style={styles.btnText}>{t('btn_request')}</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[styles.secBtn, { borderColor: colors.border, backgroundColor: colors.card }]} 
             onPress={() => navigation.navigate('CreateProfile')}
           >
             <Text style={{ color: colors.text, fontWeight: 'bold' }}>{t('btn_work')}</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  userName: { fontSize: 22, fontWeight: '900' },
  welcomeText: { fontSize: 14 },
  controlsRow: { flexDirection: 'row', gap: 10 },
  controlBtn: { padding: 10, borderRadius: 15, minWidth: 45, alignItems: 'center' },
  walletCard: { margin: 20, padding: 30, borderRadius: 30, elevation: 8 },
  walletAmount: { color: '#FFF', fontSize: 38, fontWeight: '900' },
  catScroll: { paddingLeft: 20, marginBottom: 20 },
  catItem: { padding: 12, borderRadius: 18, marginRight: 10, alignItems: 'center', minWidth: 90, borderWidth: 1, flexDirection: 'row', gap: 8 },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  jobCard: { padding: 20, borderRadius: 20, flexDirection: 'row', marginBottom: 12, borderWidth: 1 },
  jobTitle: { fontSize: 16, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginVertical: 4 },
  stars: { flexDirection: 'row' },
  jobDesc: { fontSize: 12 },
  priceTag: { justifyContent: 'center', marginLeft: 10 },
  priceValue: { fontSize: 18, fontWeight: '900', color: '#10B981' },
  emptyBox: { padding: 40, alignItems: 'center', borderRadius: 20, borderStyle: 'dashed', borderWidth: 2 },
  mainBtn: { padding: 20, borderRadius: 20, alignItems: 'center' },
  secBtn: { padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});