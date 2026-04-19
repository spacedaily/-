import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Info,
  History,
  Calculator
} from 'lucide-react';

/**
 * 祖冲之 (Zu Chongzhi) Pi Estimation Visualization
 * Uses the "Method of Cutting the Circle" (割圆术)
 */

export default function App() {
  const [sides, setSides] = useState(6);
  const [isPlaying, setIsPlaying] = useState(false);
  const radius = 180;
  const cx = 200;
  const cy = 200;

  // Maximum sides Zu Chongzhi used: up to 12288 or 24576
  const sideSteps = [6, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144, 12288, 24576];
  
  const currentStepIndex = useMemo(() => sideSteps.indexOf(sides), [sides]);

  // Calculate side length s_n for n-sided polygon inscribed in unit circle
  // Formula: s_6 = 1
  // s_2n = sqrt(2 - 2 * sqrt(1 - (s_n/2)^2))
  const calculatePiStats = (n: number) => {
    let s = 1; // n=6
    let currentN = 6;
    
    while (currentN < n) {
      const h = Math.sqrt(1 - (s / 2) ** 2);
      s = Math.sqrt(2 - 2 * h);
      currentN *= 2;
    }
    
    const perimeter = n * s;
    const piEstimate = perimeter / 2;
    return {
      sideLength: s,
      perimeter,
      piEstimate
    };
  };

  const stats = useMemo(() => calculatePiStats(sides), [sides]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < sideSteps.length - 1) {
      timer = setTimeout(() => {
        setSides(sideSteps[currentStepIndex + 1]);
      }, 1000);
    } else if (currentStepIndex === sideSteps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, sides, currentStepIndex]);

  const handleReset = () => {
    setSides(6);
    setIsPlaying(false);
  };

  const handleStep = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStepIndex < sideSteps.length - 1) {
      setSides(sideSteps[currentStepIndex + 1]);
    } else if (direction === 'prev' && currentStepIndex > 0) {
      setSides(sideSteps[currentStepIndex - 1]);
    }
  };

  // Generate SVG polygon points
  const points = useMemo(() => {
    const pts = [];
    const angleStep = (2 * Math.PI) / sides;
    for (let i = 0; i <= sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  }, [sides, cx, cy, radius]);

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg text-theme-ink font-sans selection:bg-theme-primary/10 selection:text-theme-primary">
      {/* Header */}
      <header className="h-20 px-10 flex items-center bg-theme-panel border-b border-theme-border shrink-0">
        <div className="title-group">
          <h1 className="text-2xl font-bold text-theme-primary tracking-wide">
            祖冲之 · 割圆术计算研究
          </h1>
          <p className="text-[10px] text-theme-secondary uppercase tracking-widest mt-1 font-semibold">
            The Method of Circle Cutting by Zu Chongzhi (429–500 AD)
          </p>
        </div>
      </header>

      <main className="flex-1 lg:grid lg:grid-cols-[1fr,320px] overflow-hidden">
        {/* Visualization area */}
        <section className="viz-container relative flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7fafc_100%)] border-r border-theme-border p-10">
          <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
            {/* Background circle outline */}
            <div className="absolute inset-0 rounded-full border-2 border-theme-border opacity-50" />
            
            <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 drop-shadow-sm">
              {/* Reference Circle */}
              <circle 
                cx={cx} cy={cy} r={radius} 
                fill="none" 
                stroke="var(--color-theme-border)" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
              
              {/* Dynamic Polygon */}
              <motion.polyline
                points={points}
                fill="none"
                stroke="var(--color-theme-accent)"
                strokeWidth={Math.max(1, 3 - currentStepIndex * 0.4)}
                strokeLinejoin="round"
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />

              {/* Center Dot */}
              <circle cx={cx} cy={cy} r={3} fill="var(--color-theme-primary)" />

              {/* Radius Line */}
              <line 
                x1={cx} y1={cy} 
                x2={cx + radius} y2={cy} 
                stroke="var(--color-theme-secondary)" 
                strokeWidth="1" 
                opacity="0.4"
              />
            </svg>

            {/* Sub-label */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs text-theme-secondary font-medium whitespace-nowrap">
              当前模拟：正 {sides.toLocaleString()} 边形 (内接于单位圆)
            </div>
          </div>

          {/* Inline Controls (Simplified for this theme) */}
          <div className="absolute top-8 left-8 flex flex-col gap-1">
            <span className="text-[10px] text-theme-secondary uppercase tracking-widest font-bold">迭代深度</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-bold text-theme-ink tracking-tighter">
                {currentStepIndex + 1}
              </span>
              <span className="text-sm text-theme-secondary font-medium">/ {sideSteps.length}</span>
            </div>
          </div>
        </section>

        {/* Sidebar area */}
        <aside className="data-sidebar p-8 py-10 bg-theme-panel border-l border-theme-border flex flex-col gap-8 overflow-y-auto">
          {/* Pi Stat */}
          <div className="stat-card border-l-3 border-theme-primary pl-4">
            <div className="stat-label text-[10px] text-theme-secondary font-bold uppercase tracking-widest mb-2">
              当前逼近值 (Current Approximation)
            </div>
            <div className="stat-value font-mono text-3xl font-bold text-theme-ink tracking-tight">
              {stats.piEstimate.toFixed(8)}
            </div>
          </div>

          {/* Sides Stat & Progress */}
          <div className="stat-card border-l-3 border-theme-primary pl-4">
            <div className="stat-label text-[10px] text-theme-secondary font-bold uppercase tracking-widest mb-2">
              切割边数 (Number of Sides)
            </div>
            <div className="stat-value font-mono text-3xl font-bold text-theme-ink tracking-tight">
              {sides.toLocaleString()}
            </div>
            <div className="w-full h-1.5 bg-theme-border rounded-full mt-3 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-theme-primary"
                initial={false}
                animate={{ width: `${((currentStepIndex + 1) / sideSteps.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="info-block pt-6 border-t border-theme-border text-[13px] leading-relaxed text-theme-secondary">
              <b className="text-theme-ink block mb-1">计算历程：</b>
              祖冲之通过极其繁琐的算筹运算，将圆周率精确到小数点后第七位（3.1415926至3.1415927之间），此项纪录领先世界近一千年。
            </div>

            <div className="info-block pt-6 border-t border-theme-border text-[13px] leading-relaxed text-theme-secondary">
              <b className="text-theme-ink block mb-1">密率与疏率：</b>
              <div className="grid grid-cols-2 gap-2 mt-2 font-mono">
                <div className="bg-theme-bg p-2 rounded border border-theme-border">
                  <div className="text-[9px] uppercase tracking-tighter opacity-70">密率 (Milü)</div>
                  <div className="text-theme-ink font-bold">355/113</div>
                </div>
                <div className="bg-theme-bg p-2 rounded border border-theme-border">
                  <div className="text-[9px] uppercase tracking-tighter opacity-70">疏率 (Yulü)</div>
                  <div className="text-theme-ink font-bold">22/7</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-auto pt-8 grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleStep('prev')}
              disabled={currentStepIndex === 0}
              className="px-4 py-3 border border-theme-primary text-theme-primary text-xs font-bold uppercase tracking-widest hover:bg-theme-primary hover:text-white disabled:opacity-20 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft size={14} /> 上一步
            </button>
            <button 
              onClick={() => isPlaying ? setIsPlaying(false) : (currentStepIndex === sideSteps.length - 1 ? handleReset() : setIsPlaying(true))}
              className="px-4 py-3 bg-theme-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-theme-ink transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isPlaying ? <Pause size={14} /> : (currentStepIndex === sideSteps.length - 1 ? <RotateCcw size={14} /> : <Play size={14} />)}
              {isPlaying ? '暂停' : (currentStepIndex === sideSteps.length - 1 ? '重置' : '继续迭代')}
            </button>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-14 px-10 flex items-center justify-between bg-theme-panel border-t border-theme-border shrink-0 text-[11px] text-theme-secondary font-medium">
        <div className="legend flex gap-8">
          <div className="legend-item flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-theme-accent rounded-[2px]" />
            <span>内接正多边形</span>
          </div>
          <div className="legend-item flex items-center gap-2">
            <div className="w-2.5 h-2.5 border border-theme-ink/30 rounded-[2px]" />
            <span>目标圆周</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <History size={12} className="opacity-50" />
          <span>数据参考：《隋书·律历志》</span>
        </div>
      </footer>
    </div>
  );
}
