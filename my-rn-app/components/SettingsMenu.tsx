import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.75; // 75% of screen width

interface SettingsMenuProps {
  visible: boolean;
  onClose: () => void;
  userProfile?: {
    name: string;
    email?: string;
  };
  onProfileUpdated?: () => void;
  onEditProfilePress?: () => void;
}

export default function SettingsMenu({ visible, onClose, userProfile, onProfileUpdated, onEditProfilePress }: SettingsMenuProps) {
  const slideAnim = React.useRef(new Animated.Value(-MENU_WIDTH)).current;
  const { signOut } = useAuth();


  React.useEffect(() => {

    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);



  const menuItems = [
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => {

        onEditProfilePress?.();
        onClose(); // Close settings menu when opening edit profile
      }
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      onPress: () => {
        console.log('Settings pressed');
        onClose();
      }
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => {
        console.log('Notifications pressed');
        onClose();
      }
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      onPress: () => {
        console.log('Privacy pressed');
        onClose();
      }
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => {
        console.log('Help pressed');
        onClose();
      }
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => {
        console.log('About pressed');
        onClose();
      }
    },
    {
      id: 'logout',
      title: 'Log Out',
      icon: 'log-out-outline',
      onPress: () => {
        Alert.alert(
          'Log Out',
          'Are you sure you want to log out?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Log Out',
              style: 'destructive',
              onPress: async () => {
                try {
                  onClose();
                  await signOut();
                } catch (error) {
                  console.error('Error logging out:', error);
                  Alert.alert('Error', 'Failed to log out. Please try again.');
                }
              },
            },
          ]
        );
      },
      isDanger: true
    }
  ];

  return (
    <>
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={onClose}
      >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Settings Menu */}
      <Animated.View 
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.menuHeader}>
          <View style={styles.userInfoSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
              {userProfile?.email && (
                <Text style={styles.userEmail}>{userProfile.email}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContent}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                item.isDanger && styles.dangerMenuItem
              ]}
              onPress={item.onPress}
            >
              <Ionicons 
                name={item.icon as any} 
                size={20} 
                color={item.isDanger ? '#ef4444' : '#374151'} 
                style={styles.menuIcon}
              />
              <Text style={[
                styles.menuItemText,
                item.isDanger && styles.dangerMenuItemText
              ]}>
                {item.title}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={item.isDanger ? '#ef4444' : '#9ca3af'} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.menuFooter}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </Animated.View>
    </Modal>
  </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: MENU_WIDTH,
    height: screenHeight,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuHeader: {
    backgroundColor: '#1a1a2e',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  userInfoSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#ccc',
    fontSize: 12,
  },
  menuContent: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dangerMenuItem: {
    backgroundColor: '#fef2f2',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dangerMenuItemText: {
    color: '#ef4444',
  },
  menuFooter: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
}); 