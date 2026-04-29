"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  page: number;
  pageSize: number;
  pagedResult: any;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  pagedResult,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(val) => onPageSizeChange(Number(val))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        Page {pagedResult.page} of {pagedResult.totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          disabled={!pagedResult.hasPrevious}
          onClick={() => onPageChange(page - 1)}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          disabled={!pagedResult.hasNext}
          onClick={() => onPageChange(page + 1)}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
