import api from './api';
import type { Course } from '../types';

export const uploadService = {
  extractPlaylist: async (youtubeUrl: string, config?: import('axios').AxiosRequestConfig): Promise<Course> => {
    const { data } = await api.post<Course>('/api/playlists/extract', {
      youtube_url: youtubeUrl,
    }, config);
    return data;
  },

  getMyUploads: async (): Promise<Course[]> => {
    const { data } = await api.get<Course[]>('/api/playlists/user/my-uploads');
    return data;
  },
};
