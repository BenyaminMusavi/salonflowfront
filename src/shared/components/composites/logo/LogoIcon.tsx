import Image from "next/image";
import { cn } from "@/shared/utils/className";
import saffaIcon from "@/shared/assets/logos/saffa-icon.png";

interface IProps {
  className?: string;
}

function LogoIcon({ className }: IProps) {
  return (
    <Image
      src={saffaIcon}
      alt="Saffa"
      className={cn("h-10 w-10 shrink-0 rounded-[12px]", className)}
    />
  );
}

export default LogoIcon;
