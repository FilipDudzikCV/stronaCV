import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Eye, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Listing } from "@shared/schema";

interface ListingCardProps {
  listing: Listing;
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void;
  isFavorite?: boolean;
  onClick?: () => void;
}

export function ListingCard({ 
  listing, 
  onFavoriteToggle, 
  isFavorite = false,
  onClick 
}: ListingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(listing.id, !isFavorite);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "wczoraj";
    if (diffDays < 7) return `${diffDays} dni temu`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tygodni temu`;
    return d.toLocaleDateString("pl-PL");
  };

  return (
    <Card
      className={cn(
        "listing-card transition-all duration-300 cursor-pointer",
        isHovered && "scale-105 shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={listing.images?.[0] || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop`}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white",
            isFavorite && "text-red-500"
          )}
          onClick={handleFavoriteClick}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">
          {listing.title}
        </h3>
        <p className="text-primary font-semibold text-xl mb-3">
          {listing.price} zł
          {listing.negotiable && (
            <span className="text-sm text-gray-500 ml-1">(do negocjacji)</span>
          )}
        </p>
        
        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <Badge variant="secondary" className="text-xs">
            {listing.category}
          </Badge>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{listing.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatDate(listing.createdAt!)}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{listing.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{listing.favorites || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
