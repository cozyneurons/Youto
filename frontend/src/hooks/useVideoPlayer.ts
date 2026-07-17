import { extractVideoId } from '../utils/formatters';

export function useVideoPlayer(videoUrl: string | null) {
  const videoId = extractVideoId(videoUrl);
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`
    : null;

  return { videoId, embedUrl };
}
