import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minimumDate?: Date;
};

export default function DatePickerCompat({ value, onChange, minimumDate }: Props) {
  if (Platform.OS === 'web') {
    const format = (d: Date) => d.toISOString().slice(0, 10);
    return (
      <View style={styles.webWrapper}>
        {/* Using a native HTML input for better web behavior */}
        <input
          type="date"
          value={value ? format(value) : ''}
          min={minimumDate ? format(minimumDate) : undefined}
          onChange={(e: any) => {
            const v = e.target.value;
            if (!v) return onChange(null);
            const dt = new Date(v + 'T00:00:00');
            onChange(dt);
          }}
          style={styles.webInput as any}
        />
      </View>
    );
  }

  return (
    <DateTimePicker
      value={value || new Date()}
      mode="date"
      display="inline"
      onChange={(_e, selectedDate) => onChange(selectedDate || null)}
      minimumDate={minimumDate}
    />
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    width: '100%',
  },
  webInput: {
    width: '100%',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'transparent',
  },
});
