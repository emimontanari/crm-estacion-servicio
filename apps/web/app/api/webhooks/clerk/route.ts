import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { fetchMutation } from "convex/nextjs";
import { api } from "@workspace/backend";

/**
 * Webhook handler para eventos de Clerk
 *
 * Eventos manejados:
 * - user.created: Se crea un usuario en Clerk
 * - user.updated: Se actualiza un usuario en Clerk
 * - organization.created: Se crea una organización en Clerk
 * - organization.updated: Se actualiza una organización en Clerk
 * - organizationMembership.created: Un usuario se une a una organización
 */
export async function POST(req: Request) {
  // Obtener el webhook secret de las variables de entorno
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  // Obtener los headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Si no hay headers, retornar error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Obtener el body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Crear una nueva instancia de Svix con el secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verificar el webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error: Verification failed", {
      status: 400,
    });
  }

  // Obtener el tipo de evento
  const eventType = evt.type;

  console.log(`Webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;

      case "user.updated":
        await handleUserUpdated(evt.data);
        break;

      case "organization.created":
        await handleOrganizationCreated(evt.data);
        break;

      case "organization.updated":
        await handleOrganizationUpdated(evt.data);
        break;

      case "organizationMembership.created":
        await handleOrganizationMembershipCreated(evt.data);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error);
    return new NextResponse(`Error: ${error}`, { status: 500 });
  }

  return new NextResponse("Success", { status: 200 });
}

/**
 * Manejar creación de usuario
 */
async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = data;

  const email = email_addresses[0]?.email_address;
  const name = `${first_name || ""} ${last_name || ""}`.trim() || email;
  const phone = phone_numbers[0]?.phone_number;

  // Si el usuario tiene organizaciones, crear un registro por cada una
  if (data.organization_memberships && data.organization_memberships.length > 0) {
    for (const membership of data.organization_memberships) {
      await fetchMutation(api.users.create, {
        clerkUserId: id,
        clerkOrgId: membership.organization.id,
        email,
        name,
        phone,
        avatar: image_url,
      });
    }
  }
}

/**
 * Manejar actualización de usuario
 */
async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = data;

  const email = email_addresses[0]?.email_address;
  const name = `${first_name || ""} ${last_name || ""}`.trim() || email;
  const phone = phone_numbers[0]?.phone_number;

  await fetchMutation(api.users.syncFromClerk, {
    clerkUserId: id,
    email,
    name,
    phone,
    avatar: image_url,
  });
}

/**
 * Manejar creación de organización
 */
async function handleOrganizationCreated(data: any) {
  const { id, name, slug, image_url } = data;

  await fetchMutation(api.organizations.create, {
    clerkOrgId: id,
    name,
    slug,
    email: `${slug}@example.com`, // Email por defecto, debería actualizarse
    phone: "", // Debe ser configurado por el usuario
    logo: image_url,
  });
}

/**
 * Manejar actualización de organización
 */
async function handleOrganizationUpdated(data: any) {
  const { id, name, slug, image_url } = data;

  await fetchMutation(api.organizations.syncFromClerk, {
    clerkOrgId: id,
    name,
    slug,
    imageUrl: image_url,
  });
}

/**
 * Manejar cuando un usuario se une a una organización
 */
async function handleOrganizationMembershipCreated(data: any) {
  const { organization, public_user_data } = data;

  const { user_id, identifier, first_name, last_name, image_url } = public_user_data;
  const name = `${first_name || ""} ${last_name || ""}`.trim() || identifier;

  // Crear el usuario en la base de datos si no existe
  await fetchMutation(api.users.create, {
    clerkUserId: user_id,
    clerkOrgId: organization.id,
    email: identifier,
    name,
    avatar: image_url,
  });
}
