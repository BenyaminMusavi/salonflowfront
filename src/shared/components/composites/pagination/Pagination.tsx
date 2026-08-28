'use client';
import React from 'react';
import PaginationButton from "@/shared/components/composites/pagination/PaginationButton";
import { Button } from "@/shared/components/primitives/button/Button";
import { CaretLeftIcon, CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react";

interface IPagination {
  currentPage: number;
  lastPage: number;
  loadNextPage?: () => void;
  loadPreviousPage?: () => void;
  loadPage: (pageNumber: number) => void;
}

const FIRST_PAGE_NUMBER = 1;

const Pagination = ({lastPage, currentPage, loadPreviousPage, loadNextPage, loadPage}: IPagination) => {
  const generatePageNumbers = (): (number | string)[] => {
    const totalVisiblePages = 3; // Number of pages in each group
    const pageNumbers: (number | string)[] = [];

    const startPage = Math.floor((currentPage - 1) / totalVisiblePages) * totalVisiblePages + 1;
    const endPage = Math.min(startPage + totalVisiblePages - 1, lastPage);

    // Generate the current group of pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipses if there are pages before or after the current group
    if (startPage > 1) pageNumbers.unshift('...');
    if (endPage < lastPage) pageNumbers.push('...');

    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  /* ---------------------- condition of displaying the last page number ---------------------- */
  const endThreshold = lastPage % 3 !== 0 ? lastPage - 1 : lastPage - 2;
  const shouldShowLastPage = currentPage < endThreshold || pageNumbers[pageNumbers.length - 1] === '...';
  /* -------------------------------------------------------------------------- */

  return (
    <div className={'flex w-full flex-row flex-wrap items-center justify-center gap-2 pt-6'}>
      {lastPage === 1 ? null : (
        <nav role="navigation" aria-label="pagination" className="mx-auto flex w-full justify-center">
          <ul className="flex flex-row items-center gap-2">
            {/* Previous button */}
            {loadPreviousPage && (
              <li className="me-2">
                <PreviousPage isDisable={currentPage === FIRST_PAGE_NUMBER} loadPreviousPage={loadPreviousPage} />
              </li>
            )}
            {/* First Page Button */}
            {currentPage > 3 && (
              <li>
                <PaginationButton onClick={() => loadPage(1)} title="1" isSelected={currentPage === 1} />
              </li>
            )}
            {/* Page Numbers with Ellipses */}
            {pageNumbers.map((page, index) => (
              <li key={`pagination-button-${index}`}>
                {typeof page === 'number' ? (
                  <PaginationButton
                    onClick={() => loadPage(page)}
                    title={page.toString()}
                    isSelected={currentPage === page}
                  />
                ) : (
                  <Ellipsis />
                )}
              </li>
            ))}
            {/* Last Page Button */}
            {shouldShowLastPage ? (
              <li>
                <PaginationButton
                  onClick={() => loadPage(lastPage)}
                  title={lastPage.toString()}
                  isSelected={currentPage === lastPage}
                />
              </li>
            ) : null}
            {/* Next button */}
            {loadNextPage && (
              <li className="ms-2">
                <NextPage isDisable={currentPage === lastPage} loadNextPage={loadNextPage} />
              </li>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Pagination;

interface INextPageProps {
  isDisable: boolean;
  loadNextPage: () => void;
}
const NextPage: React.FC<INextPageProps> = ({isDisable, loadNextPage}) => {
  return (
    <PaginationButton
      onClick={loadNextPage}
      icon={<CaretLeftIcon className="size-4 min-w-4" />}
      isAPageNumber={false}
      isDisabled={isDisable}
    />
  );
};

interface IPreviousPageProps {
  isDisable: boolean;
  loadPreviousPage: () => void;
}
const PreviousPage: React.FC<IPreviousPageProps> = ({isDisable, loadPreviousPage}) => {
  return (
    <PaginationButton
      onClick={loadPreviousPage}
      icon={<CaretRightIcon className="size-4 min-w-4" />}
      isAPageNumber={false}
      isDisabled={isDisable}
    />
  );
};

const Ellipsis = () => {
  return (
    <Button variant={"secondary"} size={"icon"} className="pointer-events-none flex aspect-square size-10 items-center justify-center rounded-lg px-3 py-2 text-display-sm font-semibold inner-border inner-border-secondary-10 hover:inner-border-secondary-40">
      <DotsThreeIcon className="h-9 w-9" />
    </Button>
  );
};
