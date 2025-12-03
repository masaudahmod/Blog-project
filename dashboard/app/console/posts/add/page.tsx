import { getAllPosts } from "@/lib/action";
import { PostType } from "@/lib/type";

export default async function Page() {
  const posts = await getAllPosts();

  console.log("Fetched posts:", posts.length);

  return (
    <>
      <div className="text-center mt-20 text-xl">Add Posts page</div>

      <div>
        {posts.map((post: PostType) => (
          <div key={post.id} className="p-4 border-b">
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
      </div>

      <div>
        <pre>{JSON.stringify(posts, null, 2)}</pre>
      </div>

    </>
  );
}
