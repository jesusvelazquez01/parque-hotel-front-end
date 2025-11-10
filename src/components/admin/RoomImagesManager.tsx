
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import RoomSelector from './RoomSelector';
import RoomImageCard from './RoomImageCard';
import DeleteImageDialog from './DeleteImageDialog';
import NoImagesPlaceholder from './NoImagesPlaceholder';
import { useRoomImages } from '@/hooks/useRoomImages';

const RoomImagesManager = () => {
  const {
    rooms,
    selectedRoom,
    roomImages,
    loading,
    uploading,
    isDeleteDialogOpen,
    fetchRooms,
    handleRoomSelect,
    handleFileUpload,
    handleSetPrimary,
    openDeleteDialog,
    deleteImage,
    setIsDeleteDialogOpen
  } = useRoomImages();
  
  useEffect(() => {
    fetchRooms();
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <Card className="bg-hotel-midnight border-hotel-gold/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-hotel-gold">Room Images Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !uploading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-hotel-gold" />
            </div>
          ) : (
            <>
              <RoomSelector
                rooms={rooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
                loading={loading}
              />
              
              {selectedRoom && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-4 mb-6">
                    <Button 
                      className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent relative"
                      disabled={uploading}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload New Image'}
                    </Button>
                  </div>
                  
                  {roomImages.length === 0 ? (
                    <NoImagesPlaceholder />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roomImages.map((image) => (
                        <RoomImageCard 
                          key={image.id}
                          image={image}
                          onSetPrimary={handleSetPrimary}
                          onDeleteClick={openDeleteDialog}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <DeleteImageDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={deleteImage}
      />
    </div>
  );
};

export default RoomImagesManager;
