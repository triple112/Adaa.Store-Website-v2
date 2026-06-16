import { HeadsetIcon, RefreshIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { trustItems, type TrustItem } from "@/data/techStats";

const iconMap = {
  shield: ShieldCheckIcon,
  headset: HeadsetIcon,
  refresh: RefreshIcon,
} as const;

export function TrustBar() {
  return (
    <div className="mt-16 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-3">
      {trustItems.map((item) => (
        <TrustCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function TrustCard({ item }: { item: TrustItem }) {
  const Icon = iconMap[item.icon];
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary-light">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h4 className="font-display text-base font-bold text-white">{item.title}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-subtle">{item.description}</p>
      </div>
    </div>
  );
}
