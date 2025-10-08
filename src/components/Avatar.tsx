import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars, bottts, lorelei, notionists, personas, pixelArt } from '@dicebear/collection';

interface AvatarProps {
  avatarUrl?: string;
  fallback?: string;
  size?: number;
  className?: string;
  alt?: string;
}

const styleMap = {
  avataaars,
  bottts,
  lorelei,
  notionists,
  personas,
  'pixel-art': pixelArt,
};

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  fallback,
  size = 48,
  className = '',
  alt = 'Avatar',
}) => {
  const avatarSrc = useMemo(() => {
    if (!avatarUrl) return null;

    // Check if it's a DiceBear identifier
    if (avatarUrl.startsWith('dicebear:')) {
      const [, styleId, seed] = avatarUrl.split(':');
      const style = styleMap[styleId as keyof typeof styleMap];

      if (style) {
        const avatar = createAvatar(style, {
          seed: seed || 'default',
          size,
        });
        const svg = avatar.toString();
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
      }
    }

    // Regular URL
    return avatarUrl;
  }, [avatarUrl, size]);

  return avatarSrc ? (
    <img src={avatarSrc} alt={alt} className={className} />
  ) : (
    <span className={`${className} text-white font-bold flex items-center justify-center bg-primary-500`}>
      {fallback || '?'}
    </span>
  );
};
