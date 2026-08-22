import React from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  RotateCw,
  Sliders,
  Eye,
  Check
} from 'lucide-react';
import { DeviceScreenSize } from '../types';

export interface DeviceScreenToolbarProps {
  deviceSize: DeviceScreenSize;
  onChangeDeviceSize: (size: DeviceScreenSize) => void;
  isLandscape: boolean;
  onToggleOrientation: () => void;
  scale: number;
  onChangeScale: (scale: number) => void;
  actualWindowWidth: number;
}

export const DEVICE_PRESETS = [
  {
    id: 'responsive' as DeviceScreenSize,
    label: 'Fluid Auto',
    sublabel: 'Adapts to Window',
    icon: Maximize2,
    badge: '100% Fluid'
  },
  {
    id: 'mobile-sm' as DeviceScreenSize,
    label: 'Compact Mobile',
    sublabel: '375 × 667',
    icon: Smartphone,
    badge: '375px'
  },
  {
    id: 'mobile-lg' as DeviceScreenSize,
    label: 'Standard Mobile',
    sublabel: '390 × 844',
    icon: Smartphone,
    badge: '390px'
  },
  {
    id: 'tablet' as DeviceScreenSize,
    label: 'Tablet',
    sublabel: '768 × 1024',
    icon: Tablet,
    badge: '768px'
  },
  {
    id: 'desktop' as DeviceScreenSize,
    label: 'Desktop',
    sublabel: '1280 × 800',
    icon: Monitor,
    badge: '1280px'
  }
];

export const DeviceScreenToolbar: React.FC<DeviceScreenToolbarProps> = ({
  deviceSize,
  onChangeDeviceSize,
  isLandscape,
  onToggleOrientation,
  scale,
  onChangeScale,
  actualWindowWidth
}) => {
  const isEmulated = deviceSize !== 'responsive';

  const getDimensionText = () => {
    switch (deviceSize) {
      case 'mobile-sm':
        return isLandscape ? '667 × 375 px (Landscape)' : '375 × 667 px (Portrait)';
      case 'mobile-lg':
        return isLandscape ? '844 × 390 px (Landscape)' : '390 × 844 px (Portrait)';
      case 'tablet':
        return isLandscape ? '1024 × 768 px (Landscape)' : '768 × 1024 px (Portrait)';
      case 'desktop':
        return '1280 × 800 px (Desktop Standard)';
      case 'responsive':
      default:
        return `Current Window: ${actualWindowWidth}px (${
          actualWindowWidth < 640
            ? 'Mobile Phone'
            : actualWindowWidth < 768
            ? 'Phablet'
            : actualWindowWidth < 1024
            ? 'Tablet'
            : 'Desktop'
        })`;
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-300 z-30">
      {/* Left: Device Presets Selector */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:inline-block mr-1">
          Screen Viewport:
        </span>

        <div className="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 shadow-inner">
          {DEVICE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isActive = deviceSize === preset.id;
            return (
              <button
                key={preset.id}
                id={`btn-device-preset-${preset.id}`}
                onClick={() => onChangeDeviceSize(preset.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
                title={`${preset.label} (${preset.sublabel})`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{preset.label}</span>
                <span className="sm:hidden text-[11px]">{preset.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Device Controls & Dimensions Info */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Orientation Toggle (for mobile/tablet emulation) */}
        {isEmulated && deviceSize !== 'desktop' && (
          <button
            id="btn-toggle-orientation"
            onClick={onToggleOrientation}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors cursor-pointer text-xs"
            title="Rotate Device Orientation"
          >
            <RotateCw className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isLandscape ? 'Landscape' : 'Portrait'}</span>
          </button>
        )}

        {/* Scale dropdown if emulated */}
        {isEmulated && (
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
            <span className="text-[11px] text-slate-500">Zoom:</span>
            <select
              value={scale}
              onChange={(e) => onChangeScale(parseFloat(e.target.value))}
              className="bg-transparent text-slate-300 text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="1" className="bg-slate-900 text-slate-200">100%</option>
              <option value="0.9" className="bg-slate-900 text-slate-200">90%</option>
              <option value="0.8" className="bg-slate-900 text-slate-200">80%</option>
              <option value="0.75" className="bg-slate-900 text-slate-200">75%</option>
            </select>
          </div>
        )}

        {/* Active Resolution Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-emerald-400">
          <Eye className="h-3 w-3 text-slate-400" />
          <span>{getDimensionText()}</span>
        </div>
      </div>
    </div>
  );
};
