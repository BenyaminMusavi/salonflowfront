import { cn } from "@/shared/utils/className";

interface IProps {
  className?: string;
}

function LogoIcon({ className }: IProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-10 w-10 shrink-0", className)}
    >
      <rect width="40" height="40" rx="12" className="fill-primary/12" />
      <path
        d="M10 26C10 26 14 30 20 30C26 30 30 26 30 26"
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M13 20C13 20 16 23 20 23C24 23 27 20 27 20"
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M16 14C16 14 17.5 16 20 16C22.5 16 24 14 24 14"
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

export default LogoIcon;
