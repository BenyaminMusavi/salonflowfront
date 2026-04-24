import {MouseEventHandler, ReactNode} from 'react';
import { cn } from "@/shared/utils/className";
import { Button } from "@/shared/components/primitives/button/Button";

interface IProps {
  title?: string;
  icon?: ReactNode;
  onClick: MouseEventHandler;
  isSelected?: boolean;
  isAPageNumber?: boolean; // for next and previous page button
  isDisabled?: boolean;
}

const PaginationButton = ({
  title,
  icon,
  onClick,
  isSelected = false,
  isAPageNumber = true,
  isDisabled = false,
}: IProps) => {
  return (
    <Button
      className={cn(
        'flex aspect-square size-10 cursor-pointer items-center justify-center p-3.5 font-normal inner-border-secondary-10 hover:inner-border-secondary-40',
        {
          'pointer-events-none': isDisabled,
        }
      )}
      variant={isSelected && isAPageNumber ? 'default' : 'secondary'}
      size="sm"
      onClick={onClick}
      disabled={isDisabled}
    >
      {icon ?? title}
    </Button>
  );
};

export default PaginationButton;
