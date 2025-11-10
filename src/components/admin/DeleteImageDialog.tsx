
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, X } from 'lucide-react';
import { RoomImage } from '@/types/roomImages';

interface DeleteImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteImageDialog = ({ open, onOpenChange, onConfirmDelete }: DeleteImageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-hotel-midnight border-hotel-gold/30">
        <DialogHeader>
          <DialogTitle className="text-hotel-gold">Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p className="text-white">
          Are you sure you want to delete this image? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button 
            variant="outline" 
            className="border-hotel-gold/30 text-white hover:bg-hotel-midnight"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirmDelete}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteImageDialog;
