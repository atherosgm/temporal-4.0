import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { useSettings } from '../SettingsContext';

export default function LeaveReviewScreen({ route, navigation }) {
  const { jobId, workerId } = route.params;
  const { colors, t } = useSettings();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    if (rating === 0) return Alert.alert("Error", "Por favor selecciona una puntuación.");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Guardar la reseña
      await supabase.from('reviews').insert([{
        job_id: jobId,
        reviewer_id: user.id,
        receiver_id: workerId,
        rating,
        comment
      }]);

      // 2. Actualizar el promedio del trabajador (Lógica simple)
      const { data: reviews } = await supabase.from('reviews').select('rating').eq('receiver_id', workerId);
      const avg = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

      await supabase.from('profiles').update({
        avg_rating: avg,
        total_reviews: reviews.length
      }).eq('id', workerId);

      Alert.alert("¡Gracias!", "Tu reseña ayuda a la comunidad.");
      navigation.navigate('Dashboard');
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>¿Cómo fue el servicio?</Text>
        
        {/* ESTRELLAS */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Text style={{ fontSize: 40, color: s <= rating ? '#FBBF24' : colors.textMuted }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput 
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Escribe un comentario sobre el trabajo..."
          placeholderTextColor={colors.textMuted}
          multiline
          onChangeText={setComment}
        />

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={submitReview}>
          <Text style={styles.btnText}>Enviar Calificación</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 30, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30 },
  starsRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  input: { width: '100%', height: 120, borderRadius: 20, padding: 20, borderWidth: 1, textAlignVertical: 'top' },
  btn: { marginTop: 30, padding: 20, borderRadius: 15, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});