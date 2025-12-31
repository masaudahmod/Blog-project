import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getNewsletterSubcriberPaginate } from "@/lib/action";
import { Link } from "lucide-react";

export default async function Page() {
  const currentPage = 1;

  const allSubscribers = await getNewsletterSubcriberPaginate({
    page: currentPage,
    limit: 15,
  });
  const data = allSubscribers?.data;

  const totalPages = allSubscribers?.totalPages;
  console.log("data", currentPage);
  return (
    <>
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Posts</h1>
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>{"Title " + i}</TableCell>
                <TableCell>category</TableCell>
                <TableCell className="flex items-center gap-3"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
            >
              {currentPage > 1 ? (
                <Link href={`?page=${currentPage - 1}`}>Previous</Link>
              ) : (
                <span>Previous</span>
              )}
            </Button>


            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              asChild={currentPage < totalPages}
            >
              {currentPage < totalPages ? (
                <Link href={`?page=${currentPage + 1}`}>Next</Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}



// "use client"; // এটি অবশ্যই ক্লায়েন্ট কম্পোনেন্ট হতে হবে

// import { useState, useEffect } from "react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { getNewsletterSubcriberPaginate } from "@/lib/action";

// export default function SubscriberTable() {
//   const [data, setData] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const limit = 1;

//   // ডেটা ফেচ করার ফাংশন
//   const fetchData = async (page) => {
//     setLoading(true);
//     const result = await getNewsletterSubcriberPaginate({ page, limit });
//     if (result) {
//       setData(result.data);
//       setTotalPages(result.totalPages);
//       setCurrentPage(page);
//     }
//     setLoading(false);
//   };

//   // প্রথমবার মাউন্ট হওয়ার সময় ডেটা লোড
//   useEffect(() => {
//     fetchData(1);
//   }, []);

//   return (
//     <div className="p-5">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Email</TableHead>
//             <TableHead>Date</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {loading ? (
//             <TableRow><TableCell colSpan={2}>Loading...</TableCell></TableRow>
//           ) : (
//             data.map((item) => (
//               <TableRow key={item.id}>
//                 <TableCell>{item.email}</TableCell>
//                 <TableCell>{item.created_at}</TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>

//       <div className="flex items-center justify-between mt-6">
//         <p>Page {currentPage} of {totalPages}</p>
//         <div className="flex gap-2">
//           {/* বাটন দিয়ে স্টেট হ্যান্ডেল করা */}
//           <Button 
//             onClick={() => fetchData(currentPage - 1)} 
//             disabled={currentPage <= 1 || loading}
//           >
//             Previous
//           </Button>
          
//           <Button 
//             onClick={() => fetchData(currentPage + 1)} 
//             disabled={currentPage >= totalPages || loading}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
