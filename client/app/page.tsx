import NewsletterSubscription from "@/components/NewsletterSubscription";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <h3 className="text-2xl font-bold">Home Page</h3>
      <div className="container my-10 px-2">
        <NewsletterSubscription isRow={true} />
      </div>
    </div>
  );
}
