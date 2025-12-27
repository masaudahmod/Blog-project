"use client";

import { Button } from "@/components/ui/button";
import { approveComment } from "@/lib/action";
import { useState } from "react";
import { toast } from "sonner";

export interface ApproveCommentProps {
  PostId: string | number;
  CommentId: string;
}

const ApproveComment: React.FC<ApproveCommentProps> = ({
  PostId,
  CommentId,
}) => {
  // Your component logic here
  const [loading, setLoading] = useState(false);
  const handleApprove = async () => {
    try {
      setLoading(true);
      const result = await approveComment(Number(PostId), CommentId);
      if (result) {
        setLoading(false);
        toast.success(result.message || "Comment approved successfully!");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error approving comment:", error);
    }
  };
  return (
    <Button onClick={handleApprove} variant="outline" className="ml-2">
      {loading ? "Approving..." : "Approve"}
    </Button>
  );
};

export default ApproveComment;
