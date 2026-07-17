import api from './api';

export const notesService = {
  getNotes: async (lessonId: number): Promise<string> => {
    const { data } = await api.get<{ notes: string }>(`/api/notes/${lessonId}`);
    return data.notes;
  },

  saveNotes: async (lessonId: number, notes: string): Promise<void> => {
    await api.put(`/api/notes/${lessonId}`, { notes });
  },
};
