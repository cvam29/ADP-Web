"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLoading from "@/components/page-loading";
import { getDieticianAssociationAPI } from "@/services/generated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserDetailClient from "./UserDetailClient";

const api = getDieticianAssociationAPI();

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Try to get userId from router state first, fallback to params
  const userId =
    (typeof window !== "undefined" && window.history.state?.userId) ||
    (params.id as string);

  useEffect(() => {
    async function fetchUserDetail() {
      try {
        setLoading(true);
        const res = await api.getApiUsersIdDetail(userId);
        setUserDetail(res.data);
      } catch (error) {
        console.error("Failed to fetch user detail:", error);
        setUserDetail(null);
      } finally {
        setLoading(false);
      }
    }
    console.log("userId", userId);
    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  if (loading) {
    return <PageLoading minHeightClassName="min-h-screen" message="Loading user details..." />;
  }

  if (!userDetail) {
    return (
      <div className="w-full px-6 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">User not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <UserDetailClient userDetail={userDetail} />;
}
