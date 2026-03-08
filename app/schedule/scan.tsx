import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Platform,
  ActivityIndicator, Image, TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { C } from '../../lib/constants';
import { ParsedShift } from '../../lib/types';
import { parseScheduleImage, getErrorMessage } from '../../lib/gemini';
import ScanShiftCard from '../../components/schedule/ScanShiftCard';
import Button from '../../components/ui/Button';

type Stage = 'pick' | 'scanning' | 'review' | 'error';

export default function ScanScheduleScreen() {
  const { data, addScheduledShifts } = useData();
  const router = useRouter();
  const settings = data.settings;

  const [stage, setStage] = useState<Stage>('pick');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [parsedShifts, setParsedShifts] = useState<ParsedShift[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [pickError, setPickError] = useState('');

  const pickImage = async (useCamera: boolean) => {
    setPickError('');

    // Check API key first
    if (!settings.geminiApiKey) {
      setPickError('API key required. Add your Gemini API key in Settings.');
      return;
    }

    // Request permissions
    if (useCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setPickError('Camera permission is required to scan your schedule.');
        return;
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setPickError('Photo library permission is required to scan your schedule.');
        return;
      }
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
        });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setStage('scanning');

    try {
      const shifts = await parseScheduleImage(
        asset.base64!,
        settings.roles,
        settings.geminiApiKey!,
      );
      setParsedShifts(shifts);
      setSelected(new Set(shifts.map((_, i) => i)));
      setStage('review');
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setStage('error');
    }
  };

  const toggleShift = (index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const cycleRole = (index: number) => {
    setParsedShifts(prev => {
      const next = [...prev];
      const shift = next[index];
      const roles = settings.roles;
      const currentIdx = roles.indexOf(shift.role);
      const nextRole = roles[(currentIdx + 1) % roles.length];
      next[index] = { ...shift, role: nextRole };
      return next;
    });
  };

  const handleConfirm = async () => {
    setSaving(true);
    const toAdd = parsedShifts.filter((_, i) => selected.has(i));
    addScheduledShifts(
      toAdd.map(shift => ({
        date: shift.date,
        startTime: shift.startTime,
        role: shift.role,
        estimatedHours: shift.estimatedHours,
      })),
    );
    setSaving(false);
    router.back();
  };

  const selectedCount = selected.size;

  // ── PICK STAGE ──────────────────────────────────────────────
  if (stage === 'pick') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.scanIcon}>📸</Text>
          <Text style={styles.pickTitle}>Scan Your Schedule</Text>
          <Text style={styles.pickSub}>
            Take a photo of your posted schedule or pick a screenshot
          </Text>
          {pickError ? (
            <View style={styles.pickErrorBox}>
              <Text style={styles.pickErrorText}>{pickError}</Text>
              {!settings.geminiApiKey && (
                <TouchableOpacity onPress={() => router.replace('/(tabs)/settings')}>
                  <Text style={styles.pickErrorLink}>Go to Settings</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          <View style={styles.pickButtons}>
            <TouchableOpacity
              style={styles.pickBtn}
              onPress={() => pickImage(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.pickBtnIcon}>📷</Text>
              <Text style={styles.pickBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickBtn}
              onPress={() => pickImage(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.pickBtnIcon}>🖼️</Text>
              <Text style={styles.pickBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── SCANNING STAGE ──────────────────────────────────────────
  if (stage === 'scanning') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          )}
          <ActivityIndicator size="large" color={C.purple} style={{ marginTop: 20 }} />
          <Text style={styles.scanningText}>SCANNING SCHEDULE...</Text>
          <Text style={styles.scanSubtext}>AI is reading your shifts</Text>
        </View>
      </View>
    );
  }

  // ── ERROR STAGE ─────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Couldn't Scan</Text>
          <Text style={styles.errorMsg}>{errorMsg}</Text>
          <View style={styles.errorButtons}>
            <Button onPress={() => setStage('pick')} color={C.purple} filled>
              TRY AGAIN
            </Button>
            <Button
              onPress={() => router.replace('/schedule/add')}
              color={C.textMuted}
            >
              ENTER MANUALLY
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // ── REVIEW STAGE ────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>
            {parsedShifts.length} SHIFTS FOUND
          </Text>
          <Text style={styles.reviewSub}>
            Tap to select/deselect • Tap role to change
          </Text>
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.reviewThumb} />
        )}

        {parsedShifts.map((shift, i) => (
          <ScanShiftCard
            key={i}
            shift={shift}
            selected={selected.has(i)}
            onToggle={() => toggleShift(i)}
            onCycleRole={() => cycleRole(i)}
            roles={settings.roles}
          />
        ))}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomCount}>
          {selectedCount} shift{selectedCount !== 1 ? 's' : ''} selected
        </Text>
        <Button
          onPress={handleConfirm}
          color={C.green}
          filled
          size="lg"
          disabled={selectedCount === 0 || saving}
          style={{ flex: 1 }}
        >
          {saving ? 'ADDING...' : `ADD ${selectedCount} SHIFT${selectedCount !== 1 ? 'S' : ''}`}
        </Button>
      </View>
    </View>
  );
}

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  // Pick
  scanIcon: { fontSize: 48, marginBottom: 16 },
  pickTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  pickSub: {
    color: C.textMuted,
    fontSize: 13,
    fontFamily: mono,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  pickErrorBox: {
    backgroundColor: C.danger + '18',
    borderWidth: 1,
    borderColor: C.danger + '40',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 300,
  },
  pickErrorText: {
    color: C.danger,
    fontSize: 12,
    fontFamily: mono,
    textAlign: 'center',
    lineHeight: 18,
  },
  pickErrorLink: {
    color: C.blue,
    fontSize: 12,
    fontFamily: mono,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  pickButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  pickBtn: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 10,
    minWidth: 130,
  },
  pickBtnIcon: { fontSize: 28 },
  pickBtnText: {
    color: C.text,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: mono,
  },

  // Scanning
  previewImage: {
    width: 200,
    height: 260,
    borderRadius: 12,
    opacity: 0.6,
  },
  scanningText: {
    color: C.purple,
    fontSize: 12,
    fontFamily: mono,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 16,
  },
  scanSubtext: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: mono,
    marginTop: 6,
  },

  // Error
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMsg: {
    color: C.textMuted,
    fontSize: 13,
    fontFamily: mono,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButtons: { gap: 12, width: '100%', maxWidth: 280 },

  // Review
  reviewContent: { padding: 20, paddingBottom: 100 },
  reviewHeader: { marginBottom: 16 },
  reviewTitle: {
    color: C.purple,
    fontSize: 11,
    fontFamily: mono,
    letterSpacing: 2,
    fontWeight: '700',
  },
  reviewSub: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: mono,
    marginTop: 4,
  },
  reviewThumb: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    opacity: 0.5,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bottomCount: {
    color: C.textSoft,
    fontSize: 11,
    fontFamily: mono,
    minWidth: 70,
  },
});
