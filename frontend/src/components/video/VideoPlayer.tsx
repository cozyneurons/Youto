import { useVideoPlayer } from '../../hooks/useVideoPlayer';

interface Props {
  videoUrl: string | null;
  title: string;
}

export default function VideoPlayer({ videoUrl, title }: Props) {
  const { embedUrl } = useVideoPlayer(videoUrl);

  if (!embedUrl) {
    return (
      <div className="video-placeholder">
        <p>Video not available</p>
      </div>
    );
  }

  return (
    <div className="video-player-wrapper">
      <iframe
        id="yt-player"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="video-iframe"
      />
    </div>
  );
}
