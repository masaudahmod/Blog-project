"use server";

export async function newsletterSubscribe({ email }: { email: string }) {
  try {
    const result = await fetch(
      `${process.env.NEXT_SERVER_API_URL}/newsletter-subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );
    const data = await result.json();

    return data;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}
