import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

export default function DashboardScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme, language, toggleLanguage, t } = useSettings();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setRefreshing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);
    const { data: j } = await supabase.from('jobs').select('*').eq('status', 'open').order('created_at', { ascending: false });
    setJobs(j || []);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View>
          <Text style={{ color: colors.textMuted }}>{t('welcome')}</Text>
          <Text style={[styles.name, { color: colors.text }]}>{profile?.full_name || 'User'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={toggleLanguage} style={[styles.iconBtn, { backgroundColor: colors.inputBg }]}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: colors.inputBg }]}>
            <Text>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}>
        <View style={[styles.wallet, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#FFF', opacity: 0.8 }}>{t('balance')}</Text>
          <Text style={styles.amount}>S/ {profile?.wallet_balance?.toFixed(2) || '0.00'}</Text>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={[styles.title, { color: colors.text }]}>{t('jobs_title')}</Text>
          {jobs.map(job => (
            <View key={job.id} style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>{job.title}</Text>
              <Text style={{ color: colors.success }}>S/ {job.price}</Text>
            </View>
          ))}

          <TouchableOpacity style={[styles.mainBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('RequestService')}>
            <Text style={styles.btnText}>{t('btn_request')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secBtn, { borderColor: colors.border }]} onPress={() => navigation.navigate('CreateProfile')}>
            <Text style={{ color: colors.text }}>{t('btn_work')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  name: { fontSize: 20, fontWeight: 'bold' },
  iconBtn: { padding: 10, borderRadius: 12 },
  wallet: { margin: 20, padding: 25, borderRadius: 25 },
  amount: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  jobCard: { padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  mainBtn: { padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  secBtn: { padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10, borderWidth: 1 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});