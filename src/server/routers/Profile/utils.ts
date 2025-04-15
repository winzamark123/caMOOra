import prisma from '@prisma/prisma';

interface createProfileProp {
  userId: string;
  userFirstName: string;
  userLastName: string;
  userProfilePicURL: string;
}

export async function createProfile({
  userId,
  userFirstName,
  userLastName,
  userProfilePicURL,
}: createProfileProp) {
  try {
    //create profile pic
    const profilePicId = await prisma.images.create({
      data: {
        userId: userId,
        originalUrl: userProfilePicURL,
        key: `${userId}/profilePic`,
      },
    });

    //create profile
    await prisma.profile.create({
      data: {
        userId,
        firstName: userFirstName,
        lastName: userLastName,
        profilePicId: profilePicId.id,
      },
    });
  } catch (err) {
    console.error('ERROR CREATING PROFILE' + err);
    throw new Error('ERROR CREATING PROFILE');
  }
}
