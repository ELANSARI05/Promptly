import {
  ArrowUpRight,
  AudioLines,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Compass,
  CreditCard,
  FileText,
  FlaskConical,
  HeartHandshake,
  LayoutGrid,
  Layers3,
  LogOut,
  Menu,
  Network,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Workflow,
  X,
  Zap,
  ScanSearch,
  PenLine,
  Clock3,
  ArrowRight,
  Download,
  Copy,
  Loader2,
  Globe,
  ArrowLeft,
} from 'lucide-react';
const icons = {
  arrow: ArrowUpRight,
  audio: AudioLines,
  chart: BarChart3,
  book: BookOpen,
  check: Check,
  down: ChevronDown,
  right: ChevronRight,
  help: CircleHelp,
  code: Code2,
  compass: Compass,
  card: CreditCard,
  file: FileText,
  flask: FlaskConical,
  heart: HeartHandshake,
  grid: LayoutGrid,
  layers: Layers3,
  logout: LogOut,
  menu: Menu,
  network: Network,
  plus: Plus,
  search: Search,
  settings: Settings2,
  shield: ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  wallet: Wallet,
  workflow: Workflow,
  close: X,
  zap: Zap,
  scan: ScanSearch,
  pen: PenLine,
  clock: Clock3,
  forward: ArrowRight,
  download: Download,
  copy: Copy,
  loader: Loader2,
  globe: Globe,
  back: ArrowLeft,
};
export function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Component = icons[name as keyof typeof icons] || Sparkles;
  return <Component size={size} strokeWidth={1.7} className={className} aria-hidden="true" />;
}
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-mark">
        <i />
        <i />
        <i />
      </span>
      promptly<span className="brand-dot">®</span>
    </span>
  );
}
