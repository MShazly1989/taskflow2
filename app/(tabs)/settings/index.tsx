import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Moon, Palette, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const settingSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Moon,
          label: 'Dark Mode',
          type: 'switch',
          value: isDarkMode,
          onValueChange: setIsDarkMode,
        },
        {
          icon: Bell,
          label: 'Notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: Palette,
          label: 'Appearance',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: Shield,
          label: 'Privacy & Security',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Feedback',
          type: 'link',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
          <Pressable style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>

        {settingSections.map((section, sectionIndex) => (
          <View
            key={section.title}
            style={[
              styles.section,
              sectionIndex === settingSections.length - 1 && styles.lastSection,
            ]}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem,
                  ]}
                  onPress={item.type === 'link' ? item.onPress : undefined}
                >
                  <View style={styles.settingItemLeft}>
                    <item.icon size={20} color="#007AFF" />
                    <Text style={styles.settingItemLabel}>{item.label}</Text>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                      thumbColor="#FFFFFF"
                    />
                  ) : (
                    <ChevronRight size={20} color="#C7C7CC" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable style={styles.logoutButton}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000000',
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B6B6B',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
  },
  editButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#007AFF',
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 8,
    marginLeft: 16,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
  version: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});