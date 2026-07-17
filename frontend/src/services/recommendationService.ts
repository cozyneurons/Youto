import api from './api';

export interface Recommendation {
  playlist_url: string;
  title: string;
  channel: string;
  thumbnail?: string;
  justification: string;
  reddit_signals: string[];
  _cached?: boolean;
  _no_gemini?: boolean;
  _youtube_options?: Array<{
    playlist_id: string;
    title: string;
    channel: string;
    thumbnail: string;
    playlist_url: string;
    description: string;
  }>;
}

export const recommendationService = {
  getRecommendation: async (topic: string, level: string): Promise<Recommendation> => {
    const { data } = await api.get<Recommendation>('/api/recommendations/', {
      params: { topic, level },
    });
    return data;
  },
};
