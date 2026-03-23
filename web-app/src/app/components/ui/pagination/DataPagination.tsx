import * as Icons from 'lucide-react';
import * as CardUI from '../card';
import * as LayoutUI from '../layout';
import * as SelectUI from '../select';
import { Text } from '../text';
import { Pagination } from './Pagination';
import { PaginationContent } from './PaginationContent';
import { PaginationItem } from './PaginationItem';
import { PaginationLink } from './PaginationLink';
import { PaginationNext } from './PaginationNext';
import { PaginationPrevious } from './PaginationPrevious';

const paginationLinkClassName =
  'h-10 min-w-10 rounded-lg border border-black/10 bg-transparent text-[#04090C] hover:bg-black/10 hover:text-[#04090C]';
const activePaginationLinkClassName =
  'h-10 min-w-10 rounded-lg border-[#29E68C] bg-[#29E68C] text-[#04090C] hover:bg-[#29E68C] hover:text-[#04090C]';

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_pages: number;
  total?: number;
}

interface DataPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function getVisiblePageNumbers(page: number, totalPages: number) {
  const visiblePages = Math.min(5, totalPages);

  return Array.from({ length: visiblePages }, (_, index) => {
    if (totalPages <= 5 || page <= 3) {
      return index + 1;
    }

    if (page >= totalPages - 2) {
      return totalPages - 4 + index;
    }

    return page - 2 + index;
  });
}

export function DataPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataPaginationProps) {
  const page = pagination.page || 1;
  const pageSize = pagination.page_size || 20;
  const totalPages = pagination.total_pages || 1;
  const pageNumbers = getVisiblePageNumbers(page, totalPages);

  return (
    <CardUI.Card tone="inverse" border={false}>
      <CardUI.CardContent>
        <LayoutUI.Row
          justify="justify-between"
          className="max-md:flex-col max-md:items-start max-md:gap-4"
        >
          <LayoutUI.Row gap="gap-3">
            <Text variant="muted-inverse" className="whitespace-nowrap">
              Rows per page:
            </Text>
            <SelectUI.Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectUI.SelectTrigger appearance="admin" className="h-auto w-20 rounded-lg px-3 py-2">
                <SelectUI.SelectValue>{pageSize}</SelectUI.SelectValue>
              </SelectUI.SelectTrigger>
              <SelectUI.SelectContent appearance="admin" className="rounded-xl">
                <SelectUI.SelectItem value="10">10</SelectUI.SelectItem>
                <SelectUI.SelectItem value="20">20</SelectUI.SelectItem>
                <SelectUI.SelectItem value="50">50</SelectUI.SelectItem>
                <SelectUI.SelectItem value="100">100</SelectUI.SelectItem>
              </SelectUI.SelectContent>
            </SelectUI.Select>
          </LayoutUI.Row>

          <Text variant="muted-inverse" className="max-md:hidden">
            Page {page} of {totalPages}
          </Text>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="Go to first page"
                  aria-disabled={page === 1}
                  className={paginationLinkClassName}
                  onClick={(event) => {
                    event.preventDefault();
                    if (page !== 1) onPageChange(1);
                  }}
                >
                  <Icons.ChevronsLeft className="size-4" />
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page === 1}
                  className={paginationLinkClassName}
                  onClick={(event) => {
                    event.preventDefault();
                    if (page !== 1) onPageChange(page - 1);
                  }}
                />
              </PaginationItem>

              <LayoutUI.Row gap="gap-1" className="max-md:hidden">
                {pageNumbers.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageNumber}
                      className={
                        page === pageNumber
                          ? activePaginationLinkClassName
                          : paginationLinkClassName
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        onPageChange(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </LayoutUI.Row>

              <Text variant="inverse" className="px-3 md:hidden">
                {page} / {totalPages}
              </Text>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page === totalPages || totalPages === 0}
                  className={paginationLinkClassName}
                  onClick={(event) => {
                    event.preventDefault();
                    if (page !== totalPages && totalPages !== 0) onPageChange(page + 1);
                  }}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  href="#"
                  aria-label="Go to last page"
                  aria-disabled={page === totalPages || totalPages === 0}
                  className={paginationLinkClassName}
                  onClick={(event) => {
                    event.preventDefault();
                    if (page !== totalPages && totalPages !== 0) onPageChange(totalPages);
                  }}
                >
                  <Icons.ChevronsRight className="size-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </LayoutUI.Row>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
