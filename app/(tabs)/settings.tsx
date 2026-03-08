import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Switch, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import Button from '../../components/ui/Button';

export default function SettingsScreen() {
  const { data, updateSettings, clearAllData } = useData();
  const settings = data.settings;

  const [wage, setWage] = useState(String(settings.hourlyWage));
  const [defaultHours, setDefaultHours] = useState(String(settings.defaultShiftHours));
  const [newRole, setNewRole] = useState('');
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [apiKeySaved, setApiKeySaved] = useState(!!settings.geminiApiKey);
  const [clearConfirmStep, setClearConfirmStep] = useState<0 | 1 | 2>(0);

  const saveApiKey = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      updateSettings({ geminiApiKey: trimmed });
      setApiKeySaved(true);
    }
  };

  const clearApiKey = () => {
    updateSettings({ geminiApiKey: null });
    setApiKey('');
    setApiKeySaved(false);
  };

  const saveWage = () => {
    const val = parseFloat(wage);
    if (val > 0) updateSettings({ hourlyWage: val });
  };

  const saveHours = () => {
    const val = parseFloat(defaultHours);
    if (val > 0) updateSettings({ defaultShiftHours: val });
  };

  const addRole = () => {
    const trimmed = newRole.trim();
    if (trimmed && !settings.roles.includes(trimmed)) {
      updateSettings({ roles: [...settings.roles, trimmed] });
      setNewRole('');
    }
  };

  const removeRole = (role: string) => {
    if (settings.roles.length <= 1) return;
    updateSettings({ roles: settings.roles.filter(r => r !== role) });
  };

  const handleClear = () => setClearConfirmStep(1);

  const confirmClear = async () => {
    if (clearConfirmStep === 1) {
      setClearConfirmStep(2);
    } else {
      await clearAllData();
      setClearConfirmStep(0);
    }
  };

  const REMINDER_OPTIONS = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
  ];

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Wage & Hours */}
      <Text style={styles.sectionTitle}>EARNINGS</Text>
      <View style={styles.section}>
        <View style={styles.inputRow}>
          <Text style={styles.label}>Hourly Wage</Text>
          <View style={styles.inlineInput}>
            <Text style={styles.prefix}>$</Text>
            <TextInput
              value={wage}
              onChangeText={setWage}
              onBlur={saveWage}
              keyboardType="decimal-pad"
              style={styles.smallInput}
            />
          </View>
        </View>
        <View style={[styles.inputRow, { marginBottom: 0 }]}>
          <Text style={styles.label}>Default Shift Hours</Text>
          <TextInput
            value={defaultHours}
            onChangeText={setDefaultHours}
            onBlur={saveHours}
            keyboardType="decimal-pad"
            style={styles.smallInput}
          />
        </View>
      </View>

      {/* Roles */}
      <Text style={styles.sectionTitle}>ROLES</Text>
      <View style={styles.section}>
        <View style={styles.roleChips}>
          {settings.roles.map(r => (
            <View key={r} style={styles.roleChip}>
              <Text style={styles.roleChipText}>{r}</Text>
              {settings.roles.length > 1 && (
                <TouchableOpacity onPress={() => removeRole(r)}>
                  <Text style={styles.roleRemove}>X</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <View style={styles.addRoleRow}>
          <TextInput
            value={newRole}
            onChangeText={setNewRole}
            placeholder="Add role..."
            placeholderTextColor={C.textFaint}
            style={[styles.smallInput, { flex: 1, textAlign: 'left' }]}
          />
          <Button onPress={addRole} color={C.blue} size="sm">ADD</Button>
        </View>
      </View>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Shift Reminders</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
            trackColor={{ false: C.border, true: C.green + '44' }}
            thumbColor={settings.notificationsEnabled ? C.green : C.textFaint}
          />
        </View>
        {settings.notificationsEnabled && (
          <View style={styles.optionRow}>
            <Text style={styles.sublabel}>Remind me before shift</Text>
            <View style={styles.chips}>
              {REMINDER_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, settings.shiftReminderMinutes === opt.value && styles.chipActive]}
                  onPress={() => updateSettings({ shiftReminderMinutes: opt.value })}
                >
                  <Text style={[styles.chipText, settings.shiftReminderMinutes === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Weekly Summary</Text>
          <Switch
            value={settings.weeklySummaryEnabled}
            onValueChange={(v) => updateSettings({ weeklySummaryEnabled: v })}
            trackColor={{ false: C.border, true: C.green + '44' }}
            thumbColor={settings.weeklySummaryEnabled ? C.green : C.textFaint}
          />
        </View>
        {settings.weeklySummaryEnabled && (
          <View style={styles.optionRow}>
            <Text style={styles.sublabel}>Summary day</Text>
            <View style={styles.chips}>
              {DAYS.map((day, i) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.chip, settings.weeklySummaryDay === i && styles.chipActive]}
                  onPress={() => updateSettings({ weeklySummaryDay: i })}
                >
                  <Text style={[styles.chipText, settings.weeklySummaryDay === i && styles.chipTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Cloud Sync */}
      <Text style={styles.sectionTitle}>CLOUD SYNC</Text>
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.label}>Cloud Backup</Text>
            <Text style={styles.sublabel}>Sync across devices</Text>
          </View>
          <Switch
            value={settings.cloudSyncEnabled}
            onValueChange={(v) => updateSettings({ cloudSyncEnabled: v })}
            trackColor={{ false: C.border, true: C.blue + '44' }}
            thumbColor={settings.cloudSyncEnabled ? C.blue : C.textFaint}
          />
        </View>
        {settings.cloudSyncEnabled && (
          <View style={{ marginTop: 12 }}>
            <Button onPress={() => Alert.alert('Coming Soon', 'Sign in to sync your data across devices.')} color={C.blue}>
              SIGN IN TO SYNC
            </Button>
            {settings.lastSyncedAt && (
              <Text style={styles.syncTime}>Last synced: {new Date(settings.lastSyncedAt).toLocaleString()}</Text>
            )}
          </View>
        )}
      </View>

      {/* AI Schedule Scanner */}
      <Text style={styles.sectionTitle}>AI SCHEDULE SCANNER</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Gemini API Key</Text>
        <Text style={styles.sublabel}>Powers the schedule photo scanner</Text>
        <View style={{ marginTop: 12, gap: 10 }}>
          <TextInput
            value={apiKey}
            onChangeText={(v) => { setApiKey(v); setApiKeySaved(false); }}
            placeholder="Paste your API key..."
            placeholderTextColor={C.textFaint}
            secureTextEntry={apiKeySaved}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.smallInput, { flex: undefined, minWidth: undefined, textAlign: 'left', width: '100%' }]}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              onPress={saveApiKey}
              color={C.green}
              size="sm"
              disabled={!apiKey.trim() || apiKeySaved}
            >
              {apiKeySaved ? 'SAVED' : 'SAVE KEY'}
            </Button>
            {apiKeySaved && (
              <Button onPress={clearApiKey} color={C.danger} size="sm">REMOVE</Button>
            )}
          </View>
          <Text style={[styles.sublabel, { marginTop: 0 }]}>
            Get your free key at ai.google.dev
          </Text>
        </View>
      </View>

      {/* Data Management */}
      <Text style={styles.sectionTitle}>DATA</Text>
      <View style={styles.section}>
        <Text style={styles.dataInfo}>
          {data.shifts.length} shifts | {data.schedule.length} scheduled
        </Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          <Button
            onPress={() => Alert.alert('Export', `Data exported:\n${data.shifts.length} shifts\n${data.schedule.length} scheduled shifts`)}
            color={C.gold}
          >
            EXPORT DATA
          </Button>
          <Button onPress={handleClear} color={C.danger}>CLEAR ALL DATA</Button>
        </View>
      </View>

      <Text style={styles.version}>TipTally v1.0.0</Text>

      {/* Clear Data Confirmation Modal */}
      <Modal visible={clearConfirmStep > 0} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {clearConfirmStep === 1 ? 'Clear All Data' : 'Are you sure?'}
            </Text>
            <Text style={styles.modalMsg}>
              {clearConfirmStep === 1
                ? 'This will permanently delete all your shifts and schedule. This cannot be undone.'
                : 'Last chance — all data will be lost forever.'}
            </Text>
            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoText}>
                {data.shifts.length} shifts & {data.schedule.length} scheduled will be deleted
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setClearConfirmStep(0)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={confirmClear}
              >
                <Text style={styles.modalDeleteText}>
                  {clearConfirmStep === 1 ? 'Delete Everything' : 'Yes, Delete All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 60 },
  sectionTitle: {
    color: C.textMuted,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: mono,
    marginTop: 24,
    marginBottom: 10,
    fontWeight: '600',
  },
  section: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 18,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    color: C.text,
    fontSize: 14,
    fontWeight: '500',
  },
  sublabel: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: mono,
    marginTop: 2,
  },
  prefix: {
    color: C.textMuted,
    fontFamily: mono,
    fontSize: 14,
    marginRight: 4,
  },
  inlineInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallInput: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: C.text,
    fontFamily: mono,
    fontSize: 14,
    minWidth: 75,
    textAlign: 'right',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionRow: {
    marginBottom: 14,
    marginLeft: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipActive: {
    borderColor: C.green,
    backgroundColor: C.greenBg,
  },
  chipText: {
    color: C.textMuted,
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: C.green,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.blueBg,
    borderWidth: 1,
    borderColor: C.blue + '40',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  roleChipText: {
    color: C.blue,
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '600',
  },
  roleRemove: {
    color: C.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  addRoleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dataInfo: {
    color: C.textMuted,
    fontFamily: mono,
    fontSize: 12,
  },
  syncTime: {
    color: C.textFaint,
    fontFamily: mono,
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  version: {
    color: C.textFaint,
    fontFamily: mono,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 32,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalMsg: {
    color: C.textMuted,
    fontSize: 13,
    fontFamily: mono,
    lineHeight: 20,
    marginBottom: 14,
  },
  modalInfo: {
    backgroundColor: C.danger + '15',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  modalInfoText: {
    color: C.danger,
    fontSize: 12,
    fontFamily: mono,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: C.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
