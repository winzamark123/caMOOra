import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser } from '@/server/routers/User/utils';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  /* 
    Check Event Types
  */

  // Create User in the db
  if (evt.type === 'user.created') {
    const { id, email_addresses } = evt.data;
    const first_name = evt.data.first_name || '';
    const last_name = evt.data.last_name || '';
    const image_url = evt.data.image_url || '';

    // Check if there are any email addresses
    if (!email_addresses || email_addresses.length === 0) {
      console.error('No email addresses found in webhook data');
      return new Response('Invalid user data: no email address', {
        status: 400,
      });
    }

    const primary_email = email_addresses[0].email_address;

    // Validate required fields
    if (!id || !primary_email) {
      console.error('Missing required fields:', { id, primary_email });
      return new Response('Invalid user data: missing required fields', {
        status: 400,
      });
    }

    try {
      await createUser({
        clerkId: id,
        userFirstName: first_name,
        userLastName: last_name,
        userEmail: primary_email,
        userProfilePicURL: image_url,
      });
    } catch (err) {
      console.error('Error creating user in db:', err);
      return new Response('Error creating user in db', {
        status: 500,
      });
    }
  }

  return new Response('', { status: 200 });
}
