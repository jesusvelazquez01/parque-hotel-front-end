
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RefundRequest, Booking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RefundRequestsManagement = () => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  // Fetch refund requests
  const { data: refundRequests, isLoading } = useQuery({
    queryKey: ["refund-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refund_requests")
        .select('*, booking:bookings(*)')
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as RefundRequest[];
    },
  });

  // Update refund request status mutation
  const updateRefundStatus = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string, status: 'approved_by_admin' | 'rejected' | 'approved', adminNotes: string }) => {
      const { data, error } = await supabase
        .from("refund_requests")
        .update({
          status,
          admin_notes: isSuperAdmin ? undefined : adminNotes,
          super_admin_notes: isSuperAdmin ? adminNotes : undefined,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
      
      // Send notification based on status
      if (data.status === 'approved_by_admin') {
        // Notify superadmin about new request requiring approval
        try {
          await supabase.functions.invoke('send-refund-notification', {
            body: { 
              requestId: data.id,
              status: 'approved_by_admin',
              notes: data.admin_notes,
              notifyType: 'admin_approval'
            }
          });
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      } else if (data.status === 'rejected') {
        // Notify customer about rejection
        try {
          await supabase.functions.invoke('send-refund-notification', {
            body: { 
              requestId: data.id,
              status: 'rejected',
              notes: data.admin_notes,
              notifyType: 'admin_rejection'
            }
          });
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
      
      toast.success("Refund request has been updated");
      setIsViewDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error updating refund request: ${error.message}`);
    }
  });
  
  // Delete refund request mutation
  const deleteRefundRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("refund_requests")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
      toast.success("Refund request has been deleted");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error deleting refund request: ${error.message}`);
    }
  });

  // Handle approving a refund request
  const handleApprove = () => {
    if (!selectedRequest) return;
    
    updateRefundStatus.mutate({
      id: selectedRequest.id,
      status: 'approved_by_admin',
      adminNotes
    });
  };

  // Handle rejecting a refund request
  const handleReject = () => {
    if (!selectedRequest) return;
    
    updateRefundStatus.mutate({
      id: selectedRequest.id,
      status: "rejected",
      adminNotes
    });
  };
  
  // Handle deleting a refund request
  const handleDeleteConfirm = () => {
    if (!selectedRequest) return;
    
    deleteRefundRequest.mutate(selectedRequest.id);
  };

  // View refund request details
  const handleViewRequest = (request: RefundRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setIsViewDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (request: RefundRequest) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case "approved_by_admin":
        return <Badge className="bg-blue-600">Approved by Admin</Badge>;
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-600">Rejected</Badge>;
      case "refund_initiated":
        return <Badge className="bg-green-500">Refund Initiated</Badge>;
      case "refund_failed":
        return <Badge className="bg-orange-600">Refund Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Check if refund has been processed with Razorpay
  const isRefundProcessed = (request: RefundRequest) => {
    return request.refund_id && request.refund_status === 'processed';
  };

  // Filter refund requests based on role
  const filteredRequests = refundRequests?.filter((request) => {
    if (isSuperAdmin) {
      // Super admin can see all requests
      return true;
    } else {
      // Admin should only see pending requests or ones they've processed
      return request.status !== 'approved_by_admin';
    }
  });
  
  // Check if request is processed and can be deleted
  const canDelete = (status: string) => {
    return ['approved', 'rejected', 'refund_initiated', 'refund_failed'].includes(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-hotel-gold">Refund Requests</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-hotel-gold" />
        </div>
      ) : refundRequests && refundRequests.length > 0 ? (
        <div className="bg-hotel-slate rounded-xl overflow-hidden">
          <Table>
            <TableCaption>List of refund requests</TableCaption>
            <TableHeader>
              <TableRow className="bg-hotel-midnight/50 hover:bg-hotel-midnight/70">
                <TableHead className="text-hotel-gold">Ticket ID</TableHead>
                <TableHead className="text-hotel-gold">Customer</TableHead>
                <TableHead className="text-hotel-gold">Amount</TableHead>
                <TableHead className="text-hotel-gold">Date Requested</TableHead>
                <TableHead className="text-hotel-gold">Status</TableHead>
                <TableHead className="text-hotel-gold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests?.map((request) => (
                <TableRow key={request.id} className="hover:bg-hotel-midnight/30 border-b border-hotel-midnight/30">
                  <TableCell className="font-medium text-white">{request.ticket_id}</TableCell>
                  <TableCell className="text-white">{request.customer_name}</TableCell>
                  <TableCell className="text-white">{formatCurrency(request.amount)}</TableCell>
                  <TableCell className="text-white/80">
                    {new Date(request.created_at || "").toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {formatStatus(request.status)}
                      {request.status === 'approved' && (
                        <div className="flex items-center mt-1">
                          {isRefundProcessed(request) ? (
                            <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                              Razorpay Refunded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs">
                              Pending Razorpay
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="border-hotel-gold text-hotel-gold hover:bg-hotel-gold hover:text-hotel-midnight"
                        onClick={() => handleViewRequest(request)}
                      >
                        View Details
                      </Button>
                      
                      {canDelete(request.status) && (
                        <Button
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                          onClick={() => handleOpenDeleteDialog(request)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-hotel-slate rounded-xl p-10 text-center">
          <p className="text-white text-lg mb-2">No refund requests found</p>
          <p className="text-white/70">Refund requests from customers will appear here</p>
        </div>
      )}

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-hotel-slate text-white border-hotel-gold/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-hotel-gold font-['Cormorant_Garamond']">
              Refund Request Details
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {isSuperAdmin 
                ? "Review the refund request previously approved by admin" 
                : "Review the refund request and take appropriate action"}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="text-white/70">Ticket ID:</div>
                <div className="text-white font-medium">{selectedRequest.ticket_id}</div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-white/70">Customer:</div>
                <div className="text-white">{selectedRequest.customer_name}</div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-white/70">Email:</div>
                <div className="text-white">{selectedRequest.customer_email}</div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-white/70">Refund Amount:</div>
                <div className="text-white font-medium">{formatCurrency(selectedRequest.amount)}</div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-white/70">Request Date:</div>
                <div className="text-white">
                  {new Date(selectedRequest.created_at || "").toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-white/70">Current Status:</div>
                <div>{formatStatus(selectedRequest.status)}</div>
              </div>
              
              <div className="pt-2">
                <h4 className="text-white/70 mb-1">Reason for Refund:</h4>
                <div className="bg-hotel-midnight p-3 rounded text-white min-h-[60px]">
                  {selectedRequest.reason || "No reason provided"}
                </div>
              </div>
              
              <div className="pt-2">
                <h4 className="text-white/70 mb-1">Admin Notes:</h4>
                <Textarea
                  className="bg-hotel-midnight border-hotel-slate text-white focus:ring-hotel-gold focus:border-hotel-gold"
                  placeholder="Add notes regarding this refund request"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={selectedRequest.status !== 'pending'}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                {selectedRequest.status === "pending" && (
                  <>
                    <Button 
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={handleReject}
                      disabled={updateRefundStatus.isPending}
                    >
                      {updateRefundStatus.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Reject"
                      )}
                    </Button>
                    <Button 
                      className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
                      onClick={handleApprove}
                      disabled={updateRefundStatus.isPending}
                    >
                      {updateRefundStatus.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Approve"
                      )}
                    </Button>
                  </>
                )}

                {selectedRequest.status !== "pending" && (
                  <Button 
                    onClick={() => setIsViewDialogOpen(false)}
                    className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-hotel-slate border-hotel-gold/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-hotel-gold">Delete Refund Request</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this refund request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-hotel-gold/30 text-white hover:bg-hotel-midnight/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-red-300"
              onClick={handleDeleteConfirm}
              disabled={deleteRefundRequest.isPending}
            >
              {deleteRefundRequest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RefundRequestsManagement;
