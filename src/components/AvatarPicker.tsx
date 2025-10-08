import React, { useState, useEffect, useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars, bottts, lorelei, notionists, personas, pixelArt } from '@dicebear/collection';
import { Check } from 'lucide-react';

interface AvatarPickerProps {
  seed: string; // Used to generate unique avatars (email, name, etc.)
  currentAvatarUrl?: string;
  onAvatarSelect: (avatarUrl: string) => void;
}

const avatarStyles = [
  { name: 'Avataaars', style: avataaars, id: 'avataaars' },
  { name: 'Bottts', style: bottts, id: 'bottts' },
  { name: 'Lorelei', style: lorelei, id: 'lorelei' },
  { name: 'Notionists', style: notionists, id: 'notionists' },
  { name: 'Personas', style: personas, id: 'personas' },
  { name: 'Pixel Art', style: pixelArt, id: 'pixel-art' },
];

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  seed,
  currentAvatarUrl,
  onAvatarSelect,
}) => {
  // Initialize with current style if it exists
  const initialStyle = useMemo(() => {
    if (currentAvatarUrl?.startsWith('dicebear:')) {
      const [, styleId] = currentAvatarUrl.split(':');
      return styleId || 'avataaars';
    }
    return 'avataaars';
  }, [currentAvatarUrl]);

  const [selectedStyle, setSelectedStyle] = useState<string>(initialStyle);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate SVG data URLs for each style
    const urls: Record<string, string> = {};
    avatarStyles.forEach(({ id, style }) => {
      const avatar = createAvatar(style, {
        seed: seed || 'default',
        size: 128,
      });
      const svg = avatar.toString();
      const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      urls[id] = dataUrl;
    });
    setAvatarUrls(urls);
  }, [seed]);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    // Store the avatar identifier instead of the full data URL
    onAvatarSelect(`dicebear:${styleId}:${seed}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-black mb-2">
          Choisis ton avatar
        </label>
        <p className="text-sm text-neutral-600 mb-4">
          Sélectionne un style d'avatar qui te représente
        </p>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-black shadow-neo bg-white p-1">
            {avatarUrls[selectedStyle] && (
              <img
                src={avatarUrls[selectedStyle]}
                alt="Avatar preview"
                className="w-full h-full"
              />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white px-1.5 py-0.5 text-xs font-bold border border-black">
            Aperçu
          </div>
        </div>
      </div>

      {/* Style Grid */}
      <div className="flex gap-2 flex-wrap justify-center">
        {avatarStyles.map(({ name, id }) => (
          <button
            key={id}
            onClick={() => handleStyleSelect(id)}
            title={name}
            className={`relative border-2 border-black transition-all duration-200 ${
              selectedStyle === id
                ? 'bg-primary-500 shadow-neo transform -translate-x-0.5 -translate-y-0.5'
                : 'bg-white shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5'
            }`}
          >
            <div className="w-8 h-8 p-0.5">
              {avatarUrls[id] && (
                <img
                  src={avatarUrls[id]}
                  alt={name}
                  className="w-full h-full"
                />
              )}
            </div>
            {selectedStyle === id && (
              <div className="absolute -top-1 -right-1 bg-primary-500 border border-black rounded-full">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
