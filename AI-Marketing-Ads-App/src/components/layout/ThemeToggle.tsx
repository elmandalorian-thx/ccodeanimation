import { Moon, Sun, Monitor } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-1.5 rounded-md transition-all ${
            theme === value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
          }`}
          aria-label={`${label} theme`}
          title={`${label} theme`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
