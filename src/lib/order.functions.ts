import { createServerFn } from "@tanstack/react-start";
import type { CartItem, PaymentMethod } from "@/lib/types";

export type PlaceOrderInput = {
  customer_name: string;
  phone: string;
  address: string;
  district: string;
  payment_method: PaymentMethod;
  notes?: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: CartItem[];
};

async function getSupabaseAdminClient() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Access a property to trigger the proxy's initialization and catch the error
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    supabaseAdmin.auth;
    return supabaseAdmin;
  } catch (err) {
    if (err instanceof Error && err.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return null;
    }
    throw err;
  }
}

async function placeOrderWithClient(supabase: any, input: PlaceOrderInput) {
  const orderId = crypto.randomUUID();

  const { error: orderErr } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      customer_name: input.customer_name,
      phone: input.phone,
      address: input.address,
      district: input.district,
      payment_method: input.payment_method,
      subtotal: input.subtotal,
      shipping: input.shipping,
      total: input.total,
      notes: input.notes,
    });

  if (orderErr) throw new Error(orderErr.message);

  const { error: itemsErr } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.price,
    })),
  );

  if (itemsErr) throw new Error(itemsErr.message);

  return { orderId };
}

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: PlaceOrderInput) => data)
  .handler(async ({ data }: { data: PlaceOrderInput }) => {
    if (!data.items.length) {
      throw new Error("Cart is empty");
    }

    const supabaseAdmin = await getSupabaseAdminClient();
    if (supabaseAdmin) {
      return placeOrderWithClient(supabaseAdmin, data);
    }

    const { supabase } = await import("@/integrations/supabase/client");
    return placeOrderWithClient(supabase, data);
  });
