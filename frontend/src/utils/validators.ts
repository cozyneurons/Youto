export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/playlist\?list=[\w-]+/,
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?.*list=[\w-]+/,
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /https?:\/\/youtu\.be\/[\w-]+/,
  ];
  return patterns.some(p => p.test(url));
}

export function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}
