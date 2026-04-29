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
import { ExternalLink, Pencil, Star, Trash2 } from "lucide-react";

interface UniversityTableProps {
  universities: any[];
  onEdit: (university: any) => void;
  onDelete: (id: number) => void;
}

export default function UniversityTable({
  universities,
  onEdit,
  onDelete,
}: UniversityTableProps) {
  if (universities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No universities found. Add your first university to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Survey Year</TableHead>
            <TableHead className="text-center">Colleges</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {universities.map((university) => (
            <TableRow key={university.id}>
              <TableCell className="font-medium">
                {university.universityCode}
              </TableCell>
              <TableCell>{university.name}</TableCell>
              <TableCell>
                {university.websiteUrl ? (
                  <a
                    href={
                      university.websiteUrl.startsWith("http")
                        ? university.websiteUrl
                        : `https://${university.websiteUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Visit website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground/60">No website</span>
                )}
              </TableCell>
              <TableCell>{university.universityType}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${
                        (university.rating ?? 0) >= value
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell>{university.stateName}</TableCell>
              <TableCell>{university.surveyYear}</TableCell>
              <TableCell className="text-center">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {university.collegeCount || 0}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(university)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(university.id)}
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
