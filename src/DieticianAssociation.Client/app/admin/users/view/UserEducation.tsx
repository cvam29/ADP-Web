import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface UserEducationProps {
  qualifications: any[];
}

export default function UserEducation({ qualifications }: UserEducationProps) {
  const getLevelName = (level: number) => {
    const levels = ["Undergraduate", "Postgraduate", "Doctorate", "Unknown"];
    return levels[level] || "Unknown";
  };

  const getStatusBadge = (status: number) => {
    return status === 0 ? (
      <Badge variant="secondary">Pursuing</Badge>
    ) : (
      <Badge variant="default">Completed</Badge>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Education Qualifications</CardTitle>
        <CardDescription>
          Academic qualifications and certifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {qualifications.length > 0 ? (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Course/Stream</TableHead>
                  <TableHead>University/Board</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Years</TableHead>
                  <TableHead>Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifications.map((edu) => (
                  <TableRow key={edu.id}>
                    <TableCell className="font-medium">
                      {getLevelName(edu.level)}
                    </TableCell>
                    <TableCell>{edu.courseOrStream}</TableCell>
                    <TableCell>{edu.universityOrBoard}</TableCell>
                    <TableCell>{getStatusBadge(edu.status)}</TableCell>
                    <TableCell>{edu.marks || "—"}</TableCell>
                    <TableCell>
                      {edu.startYear && edu.endYear
                        ? `${edu.startYear} - ${edu.endYear}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {edu.degreeFilePath ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(edu.degreeFilePath, "_blank")
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No education records found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
