import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useListings } from "@/hooks/use-listings";
import { ListingCard } from "@/components/listing-card";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "Wszystkie" },
  { id: "odziez", label: "Odzież" },
  { id: "obuwie", label: "Obuwie" },
  { id: "akcesoria", label: "Akcesoria" },
  { id: "bizuteria", label: "Biżuteria" },
  { id: "elektronika", label: "Elektronika" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const { data: listings = [], isLoading } = useListings(searchQuery, activeCategory);

  const handleFavoriteToggle = (id: number, isFavorite: boolean) => {
    const newFavorites = new Set(favorites);
    if (isFavorite) {
      newFavorites.add(id);
    } else {
      newFavorites.delete(id);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-primary/5 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Szukaj ogłoszeń..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base"
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Category Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-colors",
                activeCategory === category.id && "category-active"
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Brak ogłoszeń w tej kategorii</p>
            {searchQuery && (
              <p className="text-gray-400 mt-2">
                Spróbuj zmienić wyszukiwane hasło lub kategorię
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={favorites.has(listing.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => {
                  // Navigate to listing detail or open modal
                  console.log("Open listing:", listing.id);
                }}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {listings.length > 0 && (
          <div className="text-center mt-8">
            <Button size="lg" className="px-8">
              Załaduj więcej ogłoszeń
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
