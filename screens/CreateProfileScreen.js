import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import { supabase } from '../supabaseClient';

export default function CreateProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Estados del formulario (coinciden con tus columnas de Supabase)
  const [form, setForm] = useState({
    full_name: '',
    specialty: '',
    hourly_rate: '',
    experience_years: '',
    bio: '',
    whatsapp: ''
  });

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  // Carga datos existentes si el usuario ya empezó a llenar su perfil
  async function loadCurrentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm({
          full_name: data.full_name || '',
          specialty: data.specialty || '',
          hourly_rate: data.hourly_rate?.toString() || '',
          experience_years: data.experience_years || '',
          bio: data.bio || '',
          whatsapp: data.whatsapp || ''
        });
      }
    } catch (error) {
      console.log("Error cargando perfil:", error);
    } finally {
      setFetching(false);
    }
  }

  const handleUpdateProfile = async () => {
    // Validaciones básicas
    if (!form.specialty || !form.hourly_rate || !form.full_name) {
      return Alert.alert("Campos requeridos", "Por favor completa tu nombre, especialidad y tarifa.");
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          specialty: form.specialty,
          hourly_rate: parseFloat(form.hourly_rate),
          experience_years: form.experience_years,
          bio: form.bio,
          whatsapp: form.whatsapp,
          role: 'worker', // Cambiamos el rol a trabajador
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert("¡Éxito!", "Tu perfil profesional ha sido actualizado correctamente.");
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color="#10B981" /></View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#10B981', fontWeight: 'bold' }}>← Volver al Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Crear Perfil Profesional</Text>
        <Text style={styles.subtitle}>Comparte tu experiencia - cada detalle cuenta</Text>

        <View style={styles.card}>
          {/* Foto de Perfil (Placeholder por ahora) */}
          <View style={styles.photoContainer}>
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 40, color: '#10B981' }}>{form.full_name ? form.full_name[0].toUpperCase() : 'T'}</Text>
            </View>
            <TouchableOpacity style={styles.uploadBtn}>
              <Text style={styles.uploadBtnText}>📸 Subir foto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput 
            style={styles.input} 
            value={form.full_name} 
            placeholder="Tu nombre completo"
            onChangeText={(t) => setForm({...form, full_name: t})}
          />

          <Text style={styles.label}>WhatsApp de contacto *</Text>
          <TextInput 
            style={styles.input} 
            value={form.whatsapp} 
            keyboardType="phone-pad"
            placeholder="+51 999..."
            onChangeText={(t) => setForm({...form, whatsapp: t})}
          />

          <Text style={styles.label}>Tu especialidad principal *</Text>
          <TextInput 
            style={styles.input} 
            value={form.specialty} 
            placeholder="Ej: Plomero experto, Electricista..."
            onChangeText={(t) => setForm({...form, specialty: t})}
          />

          <Text style={styles.label}>Tarifa por hora (S/) *</Text>
          <TextInput 
            style={styles.input} 
            value={form.hourly_rate} 
            keyboardType="numeric"
            placeholder="Ej: 30"
            onChangeText={(t) => setForm({...form, hourly_rate: t})}
          />

          <Text style={styles.label}>Años de experiencia</Text>
          <TextInput 
            style={styles.input} 
            value={form.experience_years} 
            placeholder="Ej: 5 años o 'Principiante'"
            onChangeText={(t) => setForm({...form, experience_years: t})}
          />

          <Text style={styles.label}>Cuéntanos sobre ti (Bio)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={form.bio} 
            multiline 
            numberOfLines={4}
            placeholder="Describe tu trabajo y por qué deberían contratarte..."
            onChangeText={(t) => setForm({...form, bio: t})}
          />

          <TouchableOpacity 
            style={[styles.mainBtn, loading && { opacity: 0.7 }]} 
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Crear Mi Perfil Profesional</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.promoBox}>
            <Text style={styles.promoTitle}>✨ Especial de Lanzamiento</Text>
            <Text style={styles.promoText}>¡Tus primeros 1000 trabajos son sin comisión!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' }, // Fondo verdoso suave
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { marginBottom: 15 },
  title: { fontSize: 26, fontWeight: '900', color: '#065F46' },
  subtitle: { color: '#059669', marginBottom: 25 },
  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  photoContainer: { alignItems: 'center', marginBottom: 25 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#10B981' },
  uploadBtn: { marginTop: 10 },
  uploadBtnText: { color: '#10B981', fontWeight: 'bold' },
  label: { fontWeight: 'bold', color: '#374151', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 15, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  mainBtn: { backgroundColor: '#10B981', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  promoBox: { marginTop: 30, backgroundColor: '#FEF3C7', padding: 20, borderRadius: 20, borderLeftWidth: 5, borderLeftColor: '#F59E0B' },
  promoTitle: { fontWeight: 'bold', color: '#92400E' },
  promoText: { color: '#B45309', fontSize: 13, marginTop: 4 }
});