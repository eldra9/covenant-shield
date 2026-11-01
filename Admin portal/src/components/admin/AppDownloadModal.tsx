import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  ExternalLink,
  Shield,
  Apple,
  Info,
  Copy,
  Check,
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const downloadUrl = `${window.location.origin}/downloads/AegisGuard.apk`;
  const backendDownloadUrl = `http://${window.location.hostname}:8000/api/v1/downloads/aegisguard.apk`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(backendDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#071F1C] border border-[#C9A04A]/30 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#003C35] flex items-center justify-between bg-[#002D28]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0B5247] border border-[#C9A04A]/40 flex items-center justify-center text-[#E6CB8A]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AegisGuard Mobile Apps
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E6B45]/40 text-[#4EBA80] border border-[#1E6B45]">
                  v1.0.0 Ready
                </span>
              </h3>
              <p className="text-xs text-[#A0B2AC]">
                Downloadable mobile security terminal for Covenant Shield field guards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0B2AC] hover:text-white rounded-lg hover:bg-[#0B5247] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#003C35] bg-[#051715]">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'android'
                ? 'border-[#C9A04A] text-[#E6CB8A] bg-[#071F1C]'
                : 'border-transparent text-[#A0B2AC] hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#4EBA80]" />
            <span>Android APK (.apk)</span>
            <span className="text-[10px] bg-[#1E6B45] text-white px-1.5 py-0.2 rounded font-mono">
              Direct Download
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'ios'
                ? 'border-[#C9A04A] text-[#E6CB8A] bg-[#071F1C]'
                : 'border-transparent text-[#A0B2AC] hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4 text-[#C9A04A]" />
            <span>iOS App (iPhone / iPad)</span>
            <span className="text-[10px] bg-[#0B5247] text-[#E6CB8A] px-1.5 py-0.2 rounded font-mono">
              Installable
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'android' ? (
            <div className="space-y-4">
              {/* Download Card */}
              <div className="p-4 rounded-lg bg-[#002D28] border border-[#0B5247] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#C9A04A]" />
                      AegisGuard Android Package (APK)
                    </h4>
                    <p className="text-xs text-[#A0B2AC] mt-0.5">
                      Compiled standalone installer package • 45.8 MB • Android 7.0+
                    </p>
                  </div>
                  <a
                    href={backendDownloadUrl}
                    download="AegisGuard.apk"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E6B45] hover:bg-[#165034] text-white font-semibold text-xs transition-colors shadow-md border border-[#4EBA80]/40"
                  >
                    <Download className="w-4 h-4" />
                    Download AegisGuard.apk
                  </a>
                </div>

                <div className="pt-2 border-t border-[#0B5247] flex items-center justify-between text-xs text-[#A0B2AC]">
                  <span className="font-mono text-[11px]">Filename: AegisGuard.apk</span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-[#E6CB8A] hover:underline font-mono text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Link Copied!' : 'Copy Download URL'}
                  </button>
                </div>
              </div>

              {/* Install steps */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-[#E6CB8A] uppercase font-mono tracking-wider">
                  How to Install on Android Phone:
                </h5>
                <ol className="space-y-2 text-xs text-[#D8E2DC]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B5247] text-[#E6CB8A] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>
                      Tap <strong>Download AegisGuard.apk</strong> above on your phone or scan/copy the download URL.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B5247] text-[#E6CB8A] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Open the downloaded file in your browser's Downloads or file manager.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B5247] text-[#E6CB8A] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      If prompted by Android, tap <strong>Settings</strong> and enable <em>"Allow from this source"</em> to allow installation.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B5247] text-[#E6CB8A] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <span>
                      Tap <strong>Install</strong>. Once installed, log in with any assigned guard account (e.g.{' '}
                      <code className="text-[#E6CB8A]">d.kiptoo@covenantshield.co.ke</code> / PIN:{' '}
                      <code className="text-[#E6CB8A]">0987654321</code>).
                    </span>
                  </li>
                </ol>
              </div>

              {/* Local File Path for Developers */}
              <div className="p-3 rounded bg-[#051715] border border-[#003C35] text-[11px] text-[#A0B2AC] font-mono">
                <span className="text-[#E6CB8A] font-semibold">Local Storage Path:</span> ~/covenant_shield/downloads/AegisGuard.apk
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Option 1: PWA Install */}
              <div className="p-4 rounded-lg bg-[#002D28] border border-[#0B5247] space-y-3">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-[#E6CB8A]" />
                  <h4 className="text-sm font-bold text-white">
                    Option 1: 1-Tap Home Screen App (iPhone & iPad)
                  </h4>
                </div>
                <p className="text-xs text-[#A0B2AC]">
                  Apple allows any web security app to install directly onto the iPhone home screen as a standalone application without needing the App Store.
                </p>

                <ol className="space-y-2 text-xs text-[#D8E2DC] pt-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B5247] text-[#E6CB8A] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>
                      Open <strong>Safari</strong> on your iPhone and visit the guard app URL.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B5247] text-[#E6CB8A] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>
                      Tap the <strong>Share</strong> button at the bottom of Safari (the square icon with the upward arrow).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B5247] text-[#E6CB8A] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>
                      Scroll down and tap <strong>"Add to Home Screen"</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0B5247] text-[#E6CB8A] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <span>
                      Tap <strong>Add</strong> in the top-right. The <strong>AegisGuard</strong> app icon will appear on your iPhone screen and run in full-screen standalone mode.
                    </span>
                  </li>
                </ol>
              </div>

              {/* Option 2: Xcode / IPA Archive */}
              <div className="p-4 rounded-lg bg-[#002D28] border border-[#0B5247] space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C9A04A]" />
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Option 2: Native iOS Project (Xcode / TestFlight)
                  </h4>
                </div>
                <p className="text-xs text-[#A0B2AC]">
                  For native App Store or TestFlight distribution, the complete iOS project is bundled and pre-configured with Bundle ID <code className="text-[#E6CB8A]">co.ke.covenantshield.aegisguard</code>:
                </p>
                <div className="p-2.5 rounded bg-[#051715] border border-[#003C35] text-[11px] text-[#D8E2DC] font-mono">
                  <div>cd ~/covenant_shield/"Guard app"/flutter_app/ios</div>
                  <div>open Runner.xcworkspace</div>
                  <div className="text-[#A0B2AC] mt-1"># Or build IPA directly with Flutter on macOS:</div>
                  <div className="text-[#4EBA80]">flutter build ipa --release</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#051715] border-t border-[#003C35] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#A0B2AC]">
            <CheckCircle2 className="w-4 h-4 text-[#4EBA80]" />
            <span>Connected to Django backend database</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0B5247] hover:bg-[#165034] text-[#E6CB8A] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
