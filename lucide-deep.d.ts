// Type shim for per-icon deep imports — keeps `tsc` happy while Metro bundles
// only the icons actually referenced (the barrel pulls in all ~1900 icons).
declare module 'lucide-react-native/dist/esm/icons/*' {
  import type { LucideIcon } from 'lucide-react-native';
  const icon: LucideIcon;
  export default icon;
}
