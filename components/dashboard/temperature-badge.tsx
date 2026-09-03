import { Flame, Snowflake, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Temperature = "hot" | "warm" | "cold";

const config: Record<
  Temperature,
  { label: string; variant: "danger" | "warning" | "electric"; icon: typeof Flame }
> = {
  hot: { label: "Hot", variant: "danger", icon: Flame },
  warm: { label: "Warm", variant: "warning", icon: Sun },
  cold: { label: "Cold", variant: "electric", icon: Snowflake },
};

function TemperatureBadge({ value }: { value: Temperature }) {
  const { label, variant, icon: Icon } = config[value];

  return (
    <Badge variant={variant} size="sm">
      <Icon />
      {label}
    </Badge>
  );
}

export { TemperatureBadge, type Temperature };
