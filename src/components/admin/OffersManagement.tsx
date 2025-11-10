
import React, { useState } from 'react';
import { useOffers, Offer, OfferFormData } from '@/hooks/useOffers';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, PlusCircle, Eye, X, Check, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import OfferForm from './OfferForm';
import OfferPreview from './OfferPreview';
import { OfferStatus } from './OfferStatus';

const OffersManagement = () => {
  const { offers, isLoading, deleteOffer } = useOffers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [sortField, setSortField] = useState<keyof Offer>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Offer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOffers = offers
    ? [...offers].sort((a, b) => {
        if (sortDirection === 'asc') {
          return a[sortField] > b[sortField] ? 1 : -1;
        } else {
          return a[sortField] < b[sortField] ? 1 : -1;
        }
      })
    : [];

  const handleEditClick = (offer: Offer) => {
    setCurrentOffer(offer);
    setIsEditDialogOpen(true);
  };

  const handlePreviewClick = (offer: Offer) => {
    setCurrentOffer(offer);
    setIsPreviewDialogOpen(true);
  };

  const handleDeleteClick = (offer: Offer) => {
    setCurrentOffer(offer);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (currentOffer) {
      await deleteOffer.mutateAsync(currentOffer.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const getInitialValues = (offer: Offer): OfferFormData => {
    return {
      title: offer.title,
      description: offer.description,
      short_description: offer.short_description || '',
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      coupon_code: offer.coupon_code || '',
      start_date: offer.start_date,
      end_date: offer.end_date,
      image_url: offer.image_url || '',
      status: offer.status,
    };
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-hotel-gold">Offers &amp; Promotions</h2>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)} 
          className="bg-hotel-gold hover:bg-hotel-accent text-hotel-midnight"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add New Offer
        </Button>
      </div>
      
      <Card className="bg-hotel-slate/50 border-hotel-gold/20">
        <CardHeader>
          <CardTitle className="text-white">All Offers</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your promotional offers and discounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hotel-gold"></div>
            </div>
          ) : !offers || offers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No offers found. Create your first offer to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-hotel-gold/20">
                    <TableHead onClick={() => handleSort('title')} className="cursor-pointer">
                      Title <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('discount_value')} className="cursor-pointer">
                      Discount <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('start_date')} className="cursor-pointer">
                      Validity <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                      Status <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOffers.map((offer) => (
                    <TableRow 
                      key={offer.id} 
                      className="hover:bg-hotel-midnight/50 border-b border-hotel-gold/10"
                    >
                      <TableCell className="font-medium text-white">
                        {offer.title}
                        {offer.coupon_code && (
                          <div className="text-xs text-gray-400 mt-1">
                            Code: {offer.coupon_code}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {offer.discount_value}
                        {offer.discount_type === 'percentage' ? '%' : ' INR'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(offer.start_date)} to {formatDate(offer.end_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <OfferStatus offer={offer} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePreviewClick(offer)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(offer)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(offer)}
                            className="hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Offer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold text-xl">Create New Offer</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new promotional offer to your website
            </DialogDescription>
          </DialogHeader>
          <OfferForm 
            onComplete={() => setIsCreateDialogOpen(false)} 
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold text-xl">Edit Offer</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the details of this promotional offer
            </DialogDescription>
          </DialogHeader>
          {currentOffer && (
            <OfferForm 
              onComplete={() => setIsEditDialogOpen(false)} 
              mode="edit"
              initialValues={getInitialValues(currentOffer)}
              offerId={currentOffer.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Offer Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="bg-white text-black border-hotel-gold/20 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-hotel-midnight text-xl">Offer Preview</DialogTitle>
            <DialogDescription className="text-gray-600">
              This is how your offer will appear on the website
            </DialogDescription>
          </DialogHeader>
          {currentOffer && (
            <OfferPreview offer={currentOffer} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-hotel-slate text-white border-hotel-gold/20">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold text-xl">Delete Offer</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this offer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentOffer && (
              <div className="text-white">
                <strong>{currentOffer.title}</strong>
                <p className="text-gray-400 text-sm mt-1">
                  {currentOffer.discount_value}{currentOffer.discount_type === 'percentage' ? '%' : ' INR'} discount
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteOffer.isPending}
            >
              {deleteOffer.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Offer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OffersManagement;
