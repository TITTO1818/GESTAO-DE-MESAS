import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Smartphone, Wifi } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedClients: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  connectedClients,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Erro ao gerar QRCode:', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-neutral-900/40">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">Conectar Outro Celular</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-semibold">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>{connectedClients} aparelho(s) conectado(s) ao vivo</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Aponte a câmera do segundo celular para o QR Code abaixo para abrir o app e sincronizar as mesas em tempo real:
          </p>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-orange-500/40">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code para conectar celular"
                className="w-48 h-48 block"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-neutral-400">
                <QrCode className="w-12 h-12 animate-pulse text-orange-400" />
              </div>
            )}
          </div>

          {/* Copy Link Button */}
          <div className="w-full pt-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-500 text-white transition-colors shadow-md shadow-orange-950/40 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Link Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link do App</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
