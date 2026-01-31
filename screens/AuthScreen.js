import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

export default function AuthScreen() {
  const { colors, t } = useSettings();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) Alert.alert("Error", error.message);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.primary }]}>TEMPORAL</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t('auth_subtitle')}</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleLogin}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{t('auth_btn')}</Text>}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 40 },
  logo: { fontSize: 40, fontWeight: '900', textAlign: 'center' },
  sub: { textAlign: 'center', marginBottom: 40 },
  btn: { padding: 20, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});