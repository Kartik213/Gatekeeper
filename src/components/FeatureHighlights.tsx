import { Flag, Zap, Shield, BarChart3, Users, Code } from "lucide-react";

const FEATURES = [
  { icon: Flag, text: "Unlimited feature flags" },
  { icon: Users, text: "Team & organization support" },
  { icon: Zap, text: "Instant rollout control" },
  { icon: BarChart3, text: "Percentage-based rollouts" },
  { icon: Shield, text: "Targeting rules engine" },
  { icon: Code, text: "Lightweight SDK integration" },
];

export const FeatureHighlights = () => {
  return (
    <div className="bg-muted/50 border-border hidden w-72 flex-col justify-center border-l p-8 md:flex">
      <h2 className="text-primary mb-5 text-sm font-bold tracking-wider uppercase">What you get</h2>
      <ul className="space-y-4">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-5 shrink-0 items-center justify-center rounded-full">
              <Icon className="text-primary size-3" />
            </div>
            <span className="text-foreground text-sm">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
