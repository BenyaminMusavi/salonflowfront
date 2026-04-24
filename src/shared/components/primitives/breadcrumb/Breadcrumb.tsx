import { CaretLeftIcon } from "@phosphor-icons/react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
};

export default function Breadcrumb({ items, onNavigate }: Props) {
  return (
    <nav className="flex items-center text-[12px] text-content-secondary pt-3 pb-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {/* Label */}
            <span
              className={`cursor-pointer text-content-secondary text-[12px] ${
                isLast ? "cursor-default" : ""
              }`}
              onClick={() => {
                if (!isLast && item.href && onNavigate) {
                  onNavigate(item.href);
                }
              }}
            >
              {item.label}
            </span>

            {/* Separator */}
            {!isLast && (
              <CaretLeftIcon
                size={12}
                className="mx-1 text-content-quaternary"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}