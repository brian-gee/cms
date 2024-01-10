import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

// GET Request Handler
export const GET: APIRoute = async () => {
  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data));
};

// POST Request Handler
export const POST: APIRoute = async ({ request }) => {
  const { first_name, last_name, phone, email, address, city, zip, company } =
    await request.json();
  const { data, error } = await supabase.from("clients").insert({
    first_name,
    last_name,
    phone,
    email,
    address,
    city,
    zip,
    company,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data));
};

// DELETE Request Handler
export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  const { error } = await supabase.from("clients").delete().match({ id });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(null, { status: 204 });
};

// PUT Request Handler for editing
export const PUT: APIRoute = async ({ request }) => {
  const {
    id,
    first_name,
    last_name,
    phone,
    email,
    address,
    city,
    zip,
    company,
  } = await request.json();
  const { data, error } = await supabase
    .from("clients")
    .update({
      first_name,
      last_name,
      phone,
      email,
      address,
      city,
      zip,
      company,
    })
    .match({ id });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data));
};
