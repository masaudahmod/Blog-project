"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activateUser, deleteUser, getPendingUser } from "@/lib/action";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface UserType {
  id: number;
  name: string;
  email: string;
  role: string;
}


export default function Page() {
  const [pendingUserList, setPendingUserList] = useState<UserType[]>([]);
  const [loadingPendingUser, setLoadingPendingUser] = useState(true);
  
  useEffect(() => {
    const fetchPendingUser = async () => {
      const result = await getPendingUser();
      if (result) {
        setPendingUserList(result.users);
        setLoadingPendingUser(false);
      }
    };
    fetchPendingUser();
  }, []);
  // const pendingUser = await getPendingUser();

  const handleActivateUser = async (id: number) => {
    try {
      const result = await activateUser(id);
      if (result) {
        toast.success(result.message || "User activated successfully!");
      }
    } catch (error) {
      console.error("Error activating user:", error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const result = await deleteUser(id);
      if (result) {
        toast.success(result.message || "User deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  return (
    <div className="p-4 md:p-8 container ">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle className="text-2xl font-bold">
            Pending User Requests
          </CardTitle>
          <Badge variant="secondary" className="text-sm w-fit">
            Total: {pendingUserList?.length || 0}
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingPendingUser && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center space-y-4 text-muted-foreground"
                    >
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-5 gap-4 items-center"
                        >
                          <Skeleton className="h-5 w-10" />
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-5 w-24" />
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      ))}
                    </TableCell>
                  </TableRow>
                )}
                {!loadingPendingUser &&
                  pendingUserList.map((user: UserType) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">#{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleActivateUser(user.id)}
                            size="sm"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            size="sm"
                            variant="destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {!loadingPendingUser && pendingUserList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No Pending User Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
