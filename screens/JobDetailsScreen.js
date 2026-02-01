import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

export default function JobDetailsScreen({ route, navigation }) {
  const { job } = route.params;
  const { colors, t } = useSettings();
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user.id === job.creator_id) setIsOwner(true);
    
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', job.id)
      .eq('worker_id', user.id)
      .single();
    if (data) setHasApplied(true);
  }

  const handleApply = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('applications').insert([
        { job_id: job.id, worker_id: user.id }
      ]);
      if (error) throw error;
      Alert.alert("¡Postulación enviada!", "El cliente ha sido notificado.");
      setHasApplied(true);
    } catch (e) {
      Alert.alert("Error", "Ya has postulado a este trabajo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('back')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>
        <Text style={[styles.price, { color: colors.success }]}>S/ {job.price}</Text>
        <Text style={[styles.desc, { color: colors.text }]}>{job.description}</Text>
        
        <View style={styles.infoRow}>
          <Text style={{color: colors.textMuted}}>📍 {job.location_name || 'Ubicación no especificada'}</Text>
          <Text style={{color: colors.textMuted}}>⏳ Urgencia: {job.urgency}</Text>
        </View>

        {isOwner ? (
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary }]} 
            onPress={() => navigation.navigate('ManageApplications', { jobId: job.id })}
          >
            <Text style={styles.btnText}>Ver Postulantes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: hasApplied ? colors.textMuted : colors.primary }]} 
            onPress={handleApply}
            disabled={hasApplied || loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{hasApplied ? "Ya postulaste" : "Me interesa el trabajo"}</Text>}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  card: { margin: 20, padding: 25, borderRadius: 25, borderWidth: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  price: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
  desc: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  infoRow: { marginBottom: 30, gap: 5 },
  btn: { padding: 20, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});