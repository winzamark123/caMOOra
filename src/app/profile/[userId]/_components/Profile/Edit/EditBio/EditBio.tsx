import { useToast } from '@/hooks/use-toast';
import EditProfilePic from './EditProfilePic';
import ProfileField from './ProfileField';
import { Button } from '@/components/ui/button';
import { profileEditSchema } from '@/server/routers/Schemas/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileEditForm } from '@/server/routers/Schemas/schema';
import { trpc } from '@/lib/trpc/client';
import { FormProvider, useForm } from 'react-hook-form';

export interface EditBioProps {
  userId: string;
  setIsEditing: (value: boolean) => void;
}

export default function EditBio({ userId, setIsEditing }: EditBioProps) {
  const { toast } = useToast();
  // const utils = trpc.useUtils();

  const { data: profile, refetch: refetchProfile } =
    trpc.profile.getFullProfile.useQuery({ userId });

  const form = useForm<ProfileEditForm>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: profile?.firstName,
      lastName: profile?.lastName ?? null,
      additionalName: profile?.additionalName ?? null,
      bio: profile?.bio ?? null,
      equipment: profile?.equipment ?? null,
      isContactPublic: profile?.isContactPublic ?? false,
      isPhotographer: profile?.isPhotographer ?? false,
    },
  });

  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been updated successfully',
      });
      refetchProfile();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'An error occurred while updating your profile',
      });
    },
  });

  const onSubmit = (values: ProfileEditForm) => {
    updateProfile.mutate({ ...values });
  };

  return (
    <div>
      <h4 className="border-b-2 pb-4 font-bold">Profile</h4>
      <div className="my-3">
        <small className="text-xs">*Indicates Required</small>
      </div>
      <div className="mx-auto sm:mx-0 sm:flex">
        <EditProfilePic
          profileUrl={profile?.profilePic?.originalUrl ?? ''}
          profilePicId={profile?.profilePic?.id ?? ''}
        />
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-5 basis-3/4 sm:mt-0 sm:basis-full sm:pl-10 md:space-y-8"
          >
            <div className="grid md:grid-cols-2 md:gap-16 lg:gap-32">
              <ProfileField
                control={form.control}
                name="firstName"
                label="First Name"
                required
              />
              <ProfileField
                control={form.control}
                name="lastName"
                label="Last Name"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 md:gap-16 lg:gap-32">
              <ProfileField
                control={form.control}
                name="additionalName"
                label="Additional Name"
              />
              <div className="group relative z-0 flex w-full flex-col justify-between md:space-y-8">
                <ProfileField
                  control={form.control}
                  name="equipment"
                  label="Equipment"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 md:gap-16 lg:gap-32">
              <div className="group relative z-0 flex w-full flex-col justify-between md:space-y-8">
                <ProfileField
                  control={form.control}
                  name="bio"
                  label="Bio (Please include...)"
                  isTextArea
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 md:gap-16 lg:gap-32">
              <ProfileField
                control={form.control}
                name="isPhotographer"
                label="Activate Photographer's Account"
                isSwitch
                helpText="Deactivate to return to student account."
              />
            </div>
            <div className="flex justify-end pr-12">
              <Button
                type="submit"
                className="w-20 border border-gray-400 bg-profile_button_bg text-xs text-black hover:bg-primary_blue hover:text-white focus:bg-primary_blue focus:text-white"
                aria-label="Save Profile Section"
              >
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
