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
  Image, 
  SafeAreaView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../supabaseClient';

export default function CreateProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Estado del formulario unificado
  const [form, setForm] = useState({
    full_name: '',
    specialty: '',
    hourly_rate: '',
    experience_years: '',
    bio: '',
    whatsapp: '',
    avatar_url: null
  });

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  // 1. Cargar datos actuales del perfil
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
          whatsapp: data.whatsapp || '',
          avatar_url: data.avatar_url || null
        });
      }
    } catch (error) {
      console.log("Error al cargar perfil:", error);
    } finally {
      setFetching(false);
    }
  }

  // 2. Lógica para elegir imagen de la galería
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería para subir una foto.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  };

  // 3. Subir imagen a Supabase Storage
  const uploadImage = async (image) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user.id}/${Date.now()}.jpg`;

      // Subir al bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(image.base64), {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Actualizar tabla profiles con la nueva URL
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      setForm({ ...form, avatar_url: publicUrl });
      Alert.alert("¡Éxito!", "Foto de perfil actualizada correctamente.");
    } catch (error) {
      Alert.alert("Error de subida", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Guardar datos del perfil profesional
  const handleSaveProfile = async () => {
    if (!form.full_name || !form.specialty || !form.hourly_rate) {
      return Alert.alert("Campos requeridos", "Nombre, especialidad y tarifa son obligatorios.");
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
          role: 'worker', // Define al usuario como trabajador
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert("¡Perfil Creado!", "Ahora eres parte de la red de profesionales.");
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert("Error al guardar", error.message);
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
          <Text style={styles.backBtnText}>← Volver al Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Crear Perfil Profesional</Text>
        <Text style={styles.subtitle}>Comparte tu experiencia - cada detalle cuenta</Text>

        <View style={styles.card}>
          {/* SECCIÓN DE FOTO */}
          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.avatarCircle} onPress={pickImage} disabled={loading}>
              {form.avatar_url ? (
                <Image source={{ uri: form.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarPlaceholderText}>
                  {form.full_name ? form.full_name[0].toUpperCase() : 'T'}
                </Text>
              )}
              {loading && <ActivityIndicator style={styles.loaderOverImage} color="#FFF" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.uploadText}>Cambiar foto de perfil</Text>
            </TouchableOpacity>
          </View>

          {/* FORMULARIO */}
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput 
            style={styles.input} 
            value={form.full_name} 
            onChangeText={(t) => setForm({...form, full_name: t})}
            placeholder="Tu nombre completo"
          />

          <Text style={styles.label}>Teléfono de contacto (WhatsApp) *</Text>
          <TextInput 
            style={styles.input} 
            value={form.whatsapp} 
            keyboardType="phone-pad"
            onChangeText={(t) => setForm({...form, whatsapp: t})}
            placeholder="965079878"
          />

          <Text style={styles.label}>Tu especialidad principal *</Text>
          <TextInput 
            style={styles.input} 
            value={form.specialty} 
            onChangeText={(t) => setForm({...form, specialty: t})}
            placeholder="¿En qué eres experto?"
          />

          <Text style={styles.label}>Tarifa por hora (S/) *</Text>
          <TextInput 
            style={styles.input} 
            value={form.hourly_rate} 
            keyboardType="numeric"
            onChangeText={(t) => setForm({...form, hourly_rate: t})}
            placeholder="25"
          />

          <Text style={styles.label}>Años de experiencia</Text>
          <TextInput 
            style={styles.input} 
            value={form.experience_years} 
            onChangeText={(t) => setForm({...form, experience_years: t})}
            placeholder="Ej: 5 años"
          />

          <Text style={styles.label}>Cuéntanos sobre ti (Biografía)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={form.bio} 
            multiline 
            numberOfLines={4}
            onChangeText={(t) => setForm({...form, bio: t})}
            placeholder="Describe tu trabajo y habilidades..."
          />

          <TouchableOpacity 
            style={[styles.mainBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Crear Mi Perfil Profesional</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>¡Especial de Lanzamiento!</Text>
          <Text style={styles.promoSubtitle}>Primeros 1000 Trabajos GRATIS</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { marginBottom: 15 },
  backBtnText: { color: '#10B981', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '900', color: '#064E3B' },
  subtitle: { color: '#059669', marginBottom: 25 },
  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 20, elevation: 4 },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#10B981', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholderText: { fontSize: 40, color: '#10B981', fontWeight: 'bold' },
  loaderOverImage: { position: 'absolute' },
  uploadText: { color: '#10B981', marginTop: 8, fontWeight: 'bold', fontSize: 13 },
  label: { fontWeight: 'bold', color: '#374151', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 15, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  mainBtn: { backgroundColor: '#10B981', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  promoBanner: { marginTop: 20, backgroundColor: '#FEF3C7', padding: 20, borderRadius: 20, alignItems: 'center' },
  promoTitle: { fontWeight: 'bold', color: '#92400E', fontSize: 16 },
  promoSubtitle: { color: '#B45309', fontSize: 12 }
});