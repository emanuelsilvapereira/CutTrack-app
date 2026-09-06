export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  primaryText: string;
  secondaryText: string;
  muted: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryMuted: string;
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  white: string;
  black: string;
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
}

export const lightColors: ThemeColors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F1F3',
  primaryText: '#111827',
  secondaryText: '#6B7280',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#DCFCE7',
  primaryMuted: '#BBF7D0',
  success: '#16A34A',
  successLight: '#DCFCE7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
};

export const darkColors: ThemeColors = {
  background: '#0F1117',
  surface: '#1A1D27',
  surfaceSecondary: '#252833',
  primaryText: '#F9FAFB',
  secondaryText: '#9CA3AF',
  muted: '#6B7280',
  border: '#2D3142',
  borderLight: '#252833',
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: '#052E16',
  primaryMuted: '#14532D',
  success: '#22C55E',
  successLight: '#052E16',
  error: '#F87171',
  errorLight: '#450A0A',
  warning: '#FBBF24',
  warningLight: '#451A03',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  skeleton: '#252833',
  skeletonHighlight: '#2D3142',
};
