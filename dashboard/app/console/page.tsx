import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";

import { getPendingComments } from "@/lib/action";
import ApproveComment from "../(components)/ApproveComment";

interface Comment {
  title: string;
  postId: string | number;
  id: string | number;
  pending_comments: CommentType[];
  date: string;
}

interface CommentType {
  id: string;
  author: string;
  message: string;
  date: string;
}

export default async function Page() {
  const pendingComments = await getPendingComments();
  const Comments = pendingComments?.comments;
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
        <div className="p-4">
          <h2>All Pending Comments</h2>
          <div className="border p-2 my-4 grid grid-cols-2 gap-4">
            {Comments &&
              Comments?.map((parentComment: Comment, i: number) => (
                <div key={i} className="">
                  <h2 className="mb-2">Post Title: {parentComment?.title}</h2>
                  <b>Post comments:</b>{" "}
                  <div className="flex flex-col">
                    {parentComment?.pending_comments.map(
                      (nestedComment: CommentType, j: number) => (
                        <div key={j} className="mb-2">
                          <b>{nestedComment?.author}:</b>{" "}
                          {nestedComment?.message}
                          <ApproveComment
                            PostId={parentComment?.id}
                            CommentId={nestedComment?.id}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            {!Comments?.length && (
              <div className="col-span-2">
                <p className="text-center my-3">No pending comments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
