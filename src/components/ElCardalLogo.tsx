import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface ElCardalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const CUSTOM_LOGO_KEY = 'el_cardal_custom_logo_data';

export const ElCardalLogo: React.FC<ElCardalLogoProps> = ({
  size = 'md',
  showText = true,
}) => {
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_LOGO_KEY);
      if (saved) {
        setCustomImage(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomImage(base64);
        try {
          localStorage.setItem(CUSTOM_LOGO_KEY, base64);
        } catch {
          // storage quota
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImage(null);
    try {
      localStorage.removeItem(CUSTOM_LOGO_KEY);
    } catch {
      // ignore
    }
  };

  const dimensionClasses = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-32 h-32 sm:w-36 sm:h-36',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Hidden file input for uploading or replacing logo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Emblem Frame with glowing embers and embers background */}
      <div
        className={`relative ${dimensionClasses} rounded-2xl group cursor-pointer transition-all duration-300 hover:scale-105`}
        onClick={() => fileInputRef.current?.click()}
        title="Clique para carregar ou alterar a imagem do logo"
      >
        {/* Glow ambient layer */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6a00] via-[#ff3b00] to-[#b31404] rounded-2xl blur-md opacity-45 group-hover:opacity-75 transition-opacity" />

        {/* Outer border & charcoal background container */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#ff6a00]/40 shadow-2xl bg-[#080202]">
          {customImage ? (
            /* User uploaded custom logo */
            <img
              src={customImage}
              alt="Logo El Cardal"
              className="w-full h-full object-cover"
            />
          ) : (
            /* High-fidelity Vector Render of El Cardal Flame & Horse Logo */
            <div className="w-full h-full relative flex items-center justify-center bg-[radial-gradient(circle_at_50%_45%,#4d0b04_0%,#180302_55%,#070101_100%)]">
              {/* Hot embers and sparks texture in the background */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ff6a00_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Glowing sparks */}
              <div className="absolute top-2 left-3 w-1 h-1 rounded-full bg-amber-300 blur-[0.5px] animate-pulse" />
              <div className="absolute bottom-3 right-4 w-1.5 h-1.5 rounded-full bg-orange-400 blur-[0.5px] opacity-75" />
              <div className="absolute top-6 right-2 w-1 h-1 rounded-full bg-red-400 blur-[0.5px] opacity-80" />
              <div className="absolute bottom-6 left-2 w-1 h-1 rounded-full bg-amber-400 blur-[0.5px] opacity-60" />

              {/* The Flame & Horse Silhouette Emblem */}
              <svg
                viewBox="0 0 240 240"
                className="w-[88%] h-[88%] drop-shadow-[0_0_14px_rgba(255,106,0,0.65)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="elCardalFlame" x1="120" y1="20" x2="120" y2="220" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffaa2b" />
                    <stop offset="35%" stopColor="#ff7300" />
                    <stop offset="70%" stopColor="#f54f00" />
                    <stop offset="100%" stopColor="#d12e00" />
                  </linearGradient>

                  <filter id="flameGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Outer Flame shape */}
                <path
                  d="
                    M 128 32
                    C 134 56, 142 74, 150 90
                    C 156 82, 164 78, 172 88
                    C 178 96, 178 110, 173 122
                    C 188 136, 194 158, 189 178
                    C 183 200, 163 216, 138 220
                    C 112 224, 86 216, 68 198
                    C 50 178, 46 150, 56 126
                    C 63 108, 74 98, 82 84
                    C 86 94, 88 102, 85 112
                    C 88 94, 98 64, 128 32
                    Z
                  "
                  fill="url(#elCardalFlame)"
                />

                {/* Inner Horse Profile Cutout (Negative Space) */}
                <path
                  d="
                    M 132 94
                    C 136 102, 142 114, 152 134
                    L 150 148
                    L 138 148
                    L 124 136
                    C 123 146, 128 158, 140 166
                    C 150 174, 156 184, 154 196
                    C 142 208, 122 212, 104 206
                    C 90 200, 78 188, 75 172
                    C 72 152, 84 130, 96 116
                    C 90 132, 92 152, 104 164
                    C 112 172, 122 174, 124 164
                    C 124 154, 116 144, 112 134
                    C 106 122, 112 108, 132 94
                    Z
                  "
                  fill="#120302"
                />

                {/* Horse Muzzle & Chin refinement */}
                <path
                  d="
                    M 152 134
                    L 154 144
                    L 142 144
                    C 134 138, 128 132, 124 136
                    Z
                  "
                  fill="#140403"
                />

                {/* Inner Fire Tongue (Positive accent inside the horse's throat/chest) */}
                <path
                  d="
                    M 124 136
                    L 138 148
                    L 146 148
                    C 148 158, 144 166, 136 174
                    C 126 184, 118 194, 120 204
                    C 112 202, 106 198, 102 190
                    C 96 180, 100 166, 108 158
                    C 114 152, 120 146, 124 136
                    Z
                  "
                  fill="url(#elCardalFlame)"
                />

                {/* Horse Ear Tip */}
                <polygon points="132,94 140,102 134,106" fill="url(#elCardalFlame)" />
              </svg>
            </div>
          )}

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-2 text-white">
            <Camera className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider leading-tight text-neutral-200">
              {customImage ? 'Trocar Imagem' : 'Enviar Imagem'}
            </span>
          </div>
        </div>

        {/* Reset button if custom image exists */}
        {customImage && (
          <button
            type="button"
            onClick={handleResetToDefault}
            title="Restaurar logo padrão"
            className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 text-[10px] z-20 shadow-md"
          >
            ×
          </button>
        )}
      </div>

      {/* Restaurant Name */}
      {showText && (
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#ff6a00]" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[5px] text-transparent bg-clip-text bg-gradient-to-r from-[#ffa500] via-[#ff6a00] to-[#ff3b00] drop-shadow-[0_2px_10px_rgba(255,106,0,0.5)]">
              EL CARDAL
            </h2>
            <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#ff6a00]" />
          </div>
          <p className="text-[11px] sm:text-xs font-black tracking-[4px] text-orange-400/90 uppercase mt-1">
            PARRILLA E BAR
          </p>
        </div>
      )}
    </div>
  );
};
