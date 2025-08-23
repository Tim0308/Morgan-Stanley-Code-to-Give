import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, UserProfile } from '../lib/api';

interface EditProfileProps {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export default function EditProfile({ visible, onClose, onProfileUpdated }: EditProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    grade: '',
    relationship: 'parent',
  });

  useEffect(() => {
    console.log('EditProfile visible changed:', visible);
    if (visible) {
      loadProfile();
    }
  }, [visible]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await api.getUserProfile();
      setProfile(userProfile);
      
      // Populate form with current data (always use the latest from the server)
      const newFormData = {
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        school: userProfile.school || '',
        grade: userProfile.grade || '',
        relationship: userProfile.relationship || 'parent',
      };
      
      console.log('📝 Loading profile data into form:', newFormData);
      setFormData(newFormData);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        Alert.alert('Validation Error', 'Name is required');
        return;
      }

      // Note: Email and phone are managed by Supabase Auth, not the profiles table
      // Only validate the fields we can actually update

      setSaving(true);

      // Prepare update data (only fields supported by backend)
      const updates: any = {
        full_name: formData.name.trim(),
        school: formData.school.trim() || undefined,
        grade: formData.grade.trim() || undefined,
        locale: 'en', // Default locale
      };

      // Remove empty fields
      Object.keys(updates).forEach(key => {
        if (updates[key] === '' || updates[key] === undefined) {
          delete updates[key];
        }
      });

      const updatedProfile = await api.updateProfile(updates);
      console.log('✅ Profile updated, calling onProfileUpdated callback');
      
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Just call the callback without passing updatedProfile since Header will reload fresh data
            onProfileUpdated?.();
            onClose();
          }
        }
      ]);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onClose }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Edit Profile</Text>
          
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.headerButton, styles.saveButton]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Picture Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.changePhotoButton}>
                <Ionicons name="camera" size={16} color="#8b5cf6" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                />
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.email}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
                <Text style={styles.helperText}>Contact support to change email address</Text>
              </View>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.phone}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  editable={false}
                />
                <Text style={styles.helperText}>Contact support to change phone number</Text>
              </View>

              {/* Relationship */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Relationship</Text>
                <View style={styles.relationshipContainer}>
                  {['parent', 'guardian', 'family'].map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.relationshipOption,
                        styles.disabledOption,
                        formData.relationship === rel && styles.relationshipOptionSelected
                      ]}
                      disabled={true}
                    >
                      <Text style={[
                        styles.relationshipOptionText,
                        styles.disabledOptionText,
                        formData.relationship === rel && styles.relationshipOptionTextSelected
                      ]}>
                        {rel.charAt(0).toUpperCase() + rel.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.helperText}>Contact support to change relationship type</Text>
              </View>

              {/* School */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>School</Text>
                <TextInput
                  style={styles.input}
                  value={formData.school}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, school: text }))}
                  placeholder="Enter school name"
                  autoCapitalize="words"
                />
              </View>

              {/* Grade */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Grade</Text>
                <TextInput
                  style={styles.input}
                  value={formData.grade}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, grade: text }))}
                  placeholder="Enter grade (e.g., K1, Grade 1)"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Footer note */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                * Required fields. Your profile information helps us provide better services.
              </Text>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    paddingTop: 50,
    backgroundColor: '#1a1a2e',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  changePhotoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  relationshipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  relationshipOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  relationshipOptionSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  relationshipOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  relationshipOptionTextSelected: {
    color: 'white',
  },
  disabledOption: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  disabledOptionText: {
    color: '#9ca3af',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
}); 