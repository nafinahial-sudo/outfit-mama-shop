import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/image.optimizer";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.discount_price != null && product.discount_price < product.price;
  const effective = hasDiscount ? product.discount_price! : product.price;
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link to="/products/$productId" params={{ productId: product.id }} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted/10 flex items-center justify-center border border-border/30">
        {product.images[0] ? (
          <>
            {/* Elegant skeleton/spinner placeholder overlay */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/10 animate-pulse">
                <Loader2 className="h-6 w-6 animate-spin text-gold/50" />
              </div>
            )}
            <img
              src={getOptimizedImageUrl(product.images[0], 600)}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`max-h-full max-w-full object-contain transition-all duration-700 group-hover:scale-105 ${
                imageLoaded ? "opacity-95" : "opacity-0"
              } ${product.stock <= 0 ? "opacity-40" : ""}`}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        {product.stock <= 0 ? (
          <div className="absolute left-2 top-2 rounded-sm bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white">
            STOCK OUT
          </div>
        ) : hasDiscount && (
          <div className="absolute left-2 top-2 rounded-sm bg-gold px-2 py-0.5 text-[10px] font-semibold text-background">
            SALE
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm text-gold">৳{effective.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
