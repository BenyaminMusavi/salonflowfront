import { cn } from "@/shared/utils/className";
import LogoIcon from "./LogoIcon";

interface IProps {
  className?: string;
  showTagline?: boolean;
}

function LogoFull({ className, showTagline = true }: IProps) {
  return (
    <div className={cn("flex flex-col items-center gap-y-1.5", className)}>
      <div className="flex items-center gap-x-2">
        <LogoIcon />
        <span
          dir="ltr"
          className="text-[26px] font-bold tracking-wide text-foreground"
        >
          Saffa
        </span>
      </div>
      {showTagline ? (
        <span className="text-[12px] text-foreground-muted">
          بدون صف، با صفا
        </span>
      ) : null}
    </div>
  );
}

export default LogoFull;
