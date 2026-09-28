import { create } from 'zustand';

/** Preparation notes live only for this app session, like paper notes in an exam room. */
export const useMockNotes = create<{
  notes: Record<string, string>;
  setNotes: (cardId: string, text: string) => void;
}>()((set) => ({
  notes: {},
  setNotes: (cardId, text) =>
    set((state) => ({ notes: { ...state.notes, [cardId]: text.slice(0, 1000) } })),
}));

export function formatClock(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
