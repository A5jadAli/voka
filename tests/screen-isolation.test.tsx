import { act, fireEvent, render } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { CloudSyncProvider, LearningScopeScreen } from '@/components/cloud-sync-provider';
jest.mock('@/global.css', () => ({}));

let mockState = { ready: true, scope: 'account-a', localError: '', retry: () => {} };
jest.mock('@/features/sync/use-cloud-sync', () => ({ useCloudSync: () => mockState }));
const cleanup = jest.fn();
function PrivateForm() {
  const [text, setText] = useState('');
  useEffect(
    () => () => {
      cleanup();
    },
    [],
  );
  return <TextInput accessibilityLabel="Private draft" value={text} onChangeText={setText} />;
}
const screen = () => (
  <CloudSyncProvider>
    <LearningScopeScreen>
      <PrivateForm />
    </LearningScopeScreen>
  </CloudSyncProvider>
);

describe('private screen state at account transitions', () => {
  it('unmounts private drafts during hydration and starts the next account clean', async () => {
    cleanup.mockClear();
    mockState = { ...mockState, ready: true, scope: 'account-a' };
    const view = await render(screen());
    await fireEvent.changeText(
      view.getByLabelText('Private draft'),
      'Only account A should see this',
    );
    mockState = { ...mockState, ready: false, scope: 'account-b' };
    await view.rerender(screen());
    expect(view.queryByLabelText('Private draft')).toBeNull();
    expect(cleanup).toHaveBeenCalledTimes(1);
    mockState = { ...mockState, ready: true };
    await view.rerender(screen());
    expect(view.getByLabelText('Private draft').props.value).toBe('');
    await act(async () => {
      await view.unmount();
    });
  });
});
