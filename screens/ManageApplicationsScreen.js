import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Linking } from 'react-native';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

export default function ManageApplicationsScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { colors, t } = useSettings();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetchApplicants();
  }, []);

  async function fetchApplicants() {
    try {
      // Traemos las postulaciones y los datos del perfil del trabajador en una sola consulta
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          worker_id,
          profiles:worker_id (
            full_name,
            whatsapp,
            specialty,
            avatar_url
          )
        `)
        .eq('job_id', jobId);

      if (error) throw error;
      setApplicants(data || []);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAccept = async (appId, whatsapp) => {
    Alert.alert(
      "Aceptar Profesional",
      "¿Deseas contratar a esta persona? Se abrirá un chat de WhatsApp.",
      [
        { text: "Cancelar" },
        { text: "Aceptar", onPress: async () => {
            await supabase.from('applications').update({ status: 'accepted' }).eq('id', appId);
            Linking.openURL(`https://wa.me/${whatsapp}?text=Hola, acepté tu postulación en Temporal.`);
            fetchApplicants();
        }}
      ]
    );
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{color: colors.primary, fontWeight: 'bold'}}>{t('back')}</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Postulantes</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {applicants.length === 0 ? (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 50 }}>Nadie ha postulado aún.</Text>
        ) : (
          applicants.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 20 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.profiles.full_name}</Text>
                  <Text style={{ color: colors.textMuted }}>{item.profiles.specialty || 'Especialista'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: item.status === 'accepted' ? colors.success : colors.primary }]}
                onPress={() => handleAccept(item.id, item.profiles.whatsapp)}
                disabled={item.status === 'accepted'}
              >
                <Text style={styles.btnText}>{item.status === 'accepted' ? "Aceptado ✅" : "Aceptar y Contactar"}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 15 },
  row: { flexDirection: 'row', gap: 15, marginBottom: 15, alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  btn: { padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});