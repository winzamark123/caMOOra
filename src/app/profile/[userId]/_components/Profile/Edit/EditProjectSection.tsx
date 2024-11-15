// import EditPhotoAlbum from './EditPhotoAlbum';
import PhotoAlbum from '../PhotoAlbum/PhotoAlbum';
import { trpc } from '@/lib/trpc/client';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SelectedPhotoAlbumProps } from '../Projects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, Pencil } from 'lucide-react';

interface EditProjectSectionProps {
  userId: string;
}

export default function EditProjectSection({
  userId,
}: EditProjectSectionProps) {
  // 1. TRPC Queries and Mutations

  // tRPC utils provide methods to: Manage query cache, Handle data mutations, Control data fetching
  const utils = trpc.useUtils();

  const {
    data: photoAlbums,
    isLoading: isLoadingSections,
    refetch: refetchPhotoAlbums,
  } = trpc.photoAlbum.getAllPhotoAlbums.useQuery({ userId });

  const createPhotoAlbum = trpc.photoAlbum.createPhotoAlbum.useMutation({
    onSuccess: () => {
      console.log('Photo Album created successfully');
      refetchPhotoAlbums();
    },
    onError: (err) => {
      console.error('Error creating Photo Album', err);
    },
  });

  const updatePhotoAlbumName = trpc.photoAlbum.updatePhotoAlbumName.useMutation(
    {
      onMutate: async (newAlbum) => {
        // Cancel any outgoing fetches
        await utils.photoAlbum.getAllPhotoAlbums.cancel();

        // Save current albums state (backup)
        const previousAlbums = utils.photoAlbum.getAllPhotoAlbums.getData({
          userId,
        });

        // Update UI immediately with new name
        utils.photoAlbum.getAllPhotoAlbums.setData({ userId }, (old) => {
          if (!old) return previousAlbums;
          return old.map((album) =>
            album.id === updatedPhotoAlbumNameId
              ? { ...album, photoAlbumName: newAlbum.newPhotoAlbumName }
              : album
          );
        });

        return { previousAlbums };
      },

      onSuccess: () => {
        console.log('Photo Album updated successfully');
      },

      // If Server Update fails, revert back to old names
      onError: (err, newAlbum, context) => {
        console.error('Error updating Photo Album', err);
        utils.photoAlbum.getAllPhotoAlbums.setData(
          { userId },
          context?.previousAlbums
        );
      },

      onSettled: () => {
        // Ensure data is synced with server
        utils.photoAlbum.getAllPhotoAlbums.invalidate({ userId });
        console.log(photoAlbums);
      },
    }
  );

  const deletePhotoAlbum = trpc.photoAlbum.deletePhotoAlbum.useMutation({
    onSuccess: () => {
      console.log('Photo Album deleted successfully');
      refetchPhotoAlbums().then((refetchedData) => {
        if (
          selectedPhotoAlbum &&
          refetchedData.data &&
          refetchedData.data.length > 0
        ) {
          const newIndex =
            selectedPhotoAlbum.photoAlbumIndex > 0
              ? selectedPhotoAlbum.photoAlbumIndex - 1
              : 0;
          setSelectedPhotoAlbum({
            photoAlbumId: refetchedData.data[newIndex].id,
            photoAlbumIndex: newIndex,
          });
        } else {
          resetSelectedAlbum();
        }
      });
    },
    onError: (err) => {
      console.error('Error deleting Photo Album', err);
    },
  });

  // 2. State Management & Refs
  // Creation of Albums State and Refs
  const [newPhotoAlbumName, setNewPhotoAlbumName] = useState('');
  const [isCreatingPhotoAlbum, setIsCreatingPhotoAlbum] = useState(false);
  const createInputRef = useRef<HTMLInputElement>(null);

  // Update Photo Album Name State and Refs
  const [updatedPhotoAlbumName, setUpdatedPhotoAlbumName] = useState('');
  const [updatedPhotoAlbumNameId, setUpdatedPhotoAlbumNameId] = useState('');
  const [isUpdatingPhotoAlbumName, setIsUpdatingPhotoAlbumName] =
    useState(false);
  const updateInputRef = useRef<HTMLInputElement>(null);

  // Selected Album State and Refs
  const [selectedPhotoAlbum, setSelectedPhotoAlbum] =
    useState<SelectedPhotoAlbumProps>();
  const hasSetSelectedAlbumRef = useRef(false);

  // 3. Effects
  useEffect(() => {
    // When Photo Albums are loaded for the first time
    if (photoAlbums?.length === 0) {
      resetSelectedAlbum();
    } else if (!hasSetSelectedAlbumRef.current && photoAlbums) {
      setSelectedPhotoAlbum({
        photoAlbumId: photoAlbums[0].id,
        photoAlbumIndex: 0,
      });
      hasSetSelectedAlbumRef.current = true;
    }
  }, [photoAlbums]);

  // Focus on input when creating a new photo album (Accessibility)
  useEffect(() => {
    if (isCreatingPhotoAlbum && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [isCreatingPhotoAlbum]);

  // Focus on input when updating a photo album name (Accessibility)
  useEffect(() => {
    if (isUpdatingPhotoAlbumName && updateInputRef.current) {
      updateInputRef.current.focus();
    }
  }, [isUpdatingPhotoAlbumName]);

  // 4. Event Handlers
  const handleCreateAlbumKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleCreateNewAlbum();
    } else if (event.key === 'Escape') {
      resetCreatingState();
    }
  };
  const handleUpdateAlbumKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    oldPhotoAlbumName: string
  ) => {
    if (event.key === 'Enter') {
      handleUpdateAlbumName(oldPhotoAlbumName);
    } else if (event.key === 'Escape') {
      resetUpdatingState();
    }
  };

  const handleDeletePhotoAlbum = (photoAlbumName: string) => {
    deletePhotoAlbum.mutate({ photoAlbumName });
  };

  const handleCreateNewAlbum = () => {
    createPhotoAlbum.mutate({ photoAlbumName: newPhotoAlbumName });
    resetCreatingState();
  };

  const handleUpdateAlbumName = (oldPhotoAlbumName: string) => {
    const trimmedUpdatePhotoAlbumName = updatedPhotoAlbumName.trim();
    if (
      trimmedUpdatePhotoAlbumName !== '' &&
      trimmedUpdatePhotoAlbumName !== oldPhotoAlbumName
    ) {
      updatePhotoAlbumName.mutate({
        newPhotoAlbumName: updatedPhotoAlbumName,
        oldPhotoAlbumName,
      });
      resetUpdatingState();
    } else {
      console.log('Please enter a valid name');
    }
  };

  // 5. Utility Functions
  const resetCreatingState = () => {
    setIsCreatingPhotoAlbum(false);
    setNewPhotoAlbumName('');
  };

  const resetUpdatingState = () => {
    setIsUpdatingPhotoAlbumName(false);
    setUpdatedPhotoAlbumName('');
    setUpdatedPhotoAlbumNameId('');
  };

  const resetSelectedAlbum = () => {
    hasSetSelectedAlbumRef.current = false;
    setSelectedPhotoAlbum(undefined);
  };

  // Render
  if (isLoadingSections) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative overflow-hidden">
      <h4 className="mb-5 border-b-2 pb-4 font-bold">
        My Albums{' '}
        <span className="text-xs font-normal">
          (Please Add a Minimum of 3 Photos)
        </span>
      </h4>
      <p className="my-5 text-xs">
        Upload your photos. The first image will be used as the cover photo on
        feeds.
      </p>
      {/* TODO: Allow user to update their Photo Album names */}
      <div className="mb-5 overflow-hidden">
        <div className="flex flex-nowrap gap-x-4 overflow-x-auto py-1">
          {/* Display All Photo Albums Buttons */}
          {photoAlbums &&
            photoAlbums.map((photoAlbum, index) => (
              <div key={photoAlbum.id} className="flex shrink-0">
                {isUpdatingPhotoAlbumName &&
                updatedPhotoAlbumNameId === photoAlbum.id ? (
                  // Update input field replaces the button when editing
                  <div className="flex gap-x-2">
                    <input
                      ref={updateInputRef}
                      className="h-9 w-32 rounded-l-lg rounded-r-lg border-x border-y border-gray-400 bg-profile_button_bg px-2 text-center text-xs placeholder-slate-400"
                      type="text"
                      placeholder="Enter Album Name"
                      title="Please enter a name for you new photo album"
                      onKeyDown={(event) =>
                        handleUpdateAlbumKeyDown(
                          event,
                          photoAlbum.photoAlbumName
                        )
                      }
                      value={updatedPhotoAlbumName}
                      onChange={(e) => setUpdatedPhotoAlbumName(e.target.value)}
                    />
                    <Button
                      className="h-9 w-9 rounded-lg border border-gray-400"
                      onClick={resetUpdatingState}
                      title="Cancel"
                      aria-label="Cancel creating a new photo album"
                    >
                      ✕
                    </Button>
                    <Button
                      className="h-9 w-9 rounded-lg bg-primary_blue text-white"
                      onClick={() => {
                        handleUpdateAlbumName(photoAlbum.photoAlbumName);
                      }}
                      title="Save"
                      aria-label="Save the new photo album with the name entered in the input field"
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  // Normal button view
                  <>
                    <Button
                      className={`h-9 w-32 rounded-none rounded-l-lg border-y border-l border-gray-400 bg-primary_blue p-2 text-white hover:contrast-75 active:contrast-75 ${
                        selectedPhotoAlbum?.photoAlbumId === photoAlbum.id
                          ? 'bg-[#56647E]'
                          : ''
                      }`}
                      aria-label={`Photo Album ${photoAlbum.photoAlbumName} (${photoAlbum.Images.length} Images)`}
                      onClick={() =>
                        setSelectedPhotoAlbum({
                          photoAlbumId: photoAlbum.id,
                          photoAlbumIndex: index,
                        })
                      }
                    >
                      <span className="text-xs">
                        {photoAlbum.photoAlbumName}
                      </span>
                      <span className="sr-only">{`Photo Album ${photoAlbum.photoAlbumName} (${photoAlbum.Images.length} Images)`}</span>
                    </Button>
                    <DropdownMenu>
                      {/* Edit Button (Open Pop-Up) */}
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          className="h-9 rounded-none rounded-r-lg border-y border-r border-gray-400 bg-[#C2C4C6] hover:bg-[#C2C4C6] "
                          aria-label={`Toggle Menu for ${photoAlbum.photoAlbumName}`}
                        >
                          <Pencil color="rgb(1,60,90)" className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="space-y-1">
                        {/* Delete Album Button */}
                        <DropdownMenuItem asChild>
                          <Button
                            onClick={() => {
                              handleDeletePhotoAlbum(photoAlbum.photoAlbumName);
                            }}
                            className="flex w-full cursor-pointer space-x-2 bg-red-600 text-white focus:bg-red-600 focus:text-white lg:bg-white lg:text-black"
                            tabIndex={0}
                            aria-label={`Delete ${photoAlbum.photoAlbumName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-xs">Delete Album</span>
                            <span className="sr-only">
                              Delete {photoAlbum.photoAlbumName}
                            </span>
                          </Button>
                        </DropdownMenuItem>
                        {/* Update Album Name Button */}
                        <DropdownMenuItem asChild>
                          <Button
                            className="flex w-full cursor-pointer space-x-2 bg-blue-600 text-white focus:bg-blue-600 focus:text-white lg:bg-white lg:text-black"
                            aria-label={`Update Name for ${photoAlbum.photoAlbumName}`}
                            tabIndex={0}
                            onClick={() => {
                              setIsUpdatingPhotoAlbumName(true);
                              setUpdatedPhotoAlbumNameId(photoAlbum.id);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="text-xs">Update Name</span>
                            <span className="sr-only">
                              Update Name for {photoAlbum.photoAlbumName}
                            </span>
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          {isCreatingPhotoAlbum && (
            <div className="shrink-0">
              <input
                ref={createInputRef}
                id="add-photo-album-name"
                className="h-9 w-32 rounded-full border-2 border-blue-700 bg-profile_button_bg text-center text-xs placeholder-slate-400"
                type="text"
                placeholder="Enter Album Name"
                title="Please enter a name for you new photo album"
                onKeyDown={handleCreateAlbumKeyDown}
                value={newPhotoAlbumName}
                onChange={(e) => setNewPhotoAlbumName(e.target.value)}
              />
              <Button
                className="h-9 w-9 rounded-lg border border-gray-400"
                onClick={resetCreatingState}
                title="Cancel"
                aria-label="Cancel creating a new photo album"
              >
                ✕
              </Button>
              <Button
                className="h-9 w-9 rounded-lg bg-primary_blue text-white"
                onClick={handleCreateNewAlbum}
                title="Save"
                aria-label="Save the new photo album with the name entered in the input field"
              >
                ✓
              </Button>
            </div>
          )}
          <Button
            className="shrink-0 rounded-lg border border-gray-400 bg-profile_button_bg text-xs text-black hover:bg-primary_blue hover:text-white focus:bg-primary_blue  focus:text-white "
            aria-label="Create a New Photo Album"
            onClick={() => {
              setIsCreatingPhotoAlbum(true);
            }}
          >
            +
          </Button>
        </div>
      </div>

      {selectedPhotoAlbum && photoAlbums && (
        <PhotoAlbum
          photoAlbumId={selectedPhotoAlbum.photoAlbumId}
          userId={userId}
          isEditing={true}
        />
      )}
      {!selectedPhotoAlbum && <div>No Photo Albums Available</div>}
    </div>
  );
}
