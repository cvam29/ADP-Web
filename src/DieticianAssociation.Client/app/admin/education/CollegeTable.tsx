"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface CollegeTableProps {
  colleges: any[];
  onEdit: (college: any) => void;
  onDelete: (id: number) => void;
}

export default function CollegeTable({
  colleges,
  onEdit,
  onDelete,
}: CollegeTableProps) {
  if (colleges.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No colleges found. Add your first college to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>AISHE Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>University</TableHead>
            <TableHead>State</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Established</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colleges.map((college) => (
            <TableRow key={college.id}>
              <TableCell className="font-medium">{college.aisheCode}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{college.name}</div>
                  {college.website && (
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      Visit website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>{college.universityName}</TableCell>
              <TableCell>{college.stateName}</TableCell>
              <TableCell>{college.districtName}</TableCell>
              <TableCell>
                {college.yearOfEstablishment ?? "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(college)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(college.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
