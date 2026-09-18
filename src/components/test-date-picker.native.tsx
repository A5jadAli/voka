import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export function TestDatePicker({
  minimumDate,
  onChange,
  value,
}: {
  minimumDate: Date;
  onChange: (date: Date, dismissed: boolean) => void;
  value: Date;
}) {
  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    onChange(selected ?? value, event.type === 'dismissed');
  };
  return (
    <DateTimePicker
      display={Platform.OS === 'ios' ? 'inline' : 'default'}
      minimumDate={minimumDate}
      mode="date"
      onChange={handleChange}
      value={value}
    />
  );
}
