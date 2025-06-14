import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  MapPin, 
  Heart, 
  Eye, 
  Settings, 
  LogOut, 
  MoreVertical,
  Edit,
  Pause,
  Trash2,
  RotateCcw,
  MessageCircle
} from "lucide-react";
import { useUserListings, useUpdateListing, useDeleteListing } from "@/hooks/use-listings";
import { cn } from "@/lib/utils";
import type { Listing } from "@shared/schema";

const filterOptions = [
  { id: "all", label: "Wszystkie", count: 12 },
  { id: "active", label: "Aktywne", count: 8 },
  { id: "sold", label: "Sprzedane", count: 4 },
];

export default function Profile() {
  const [activeFilter, setActiveFilter] = useState("all");
  const userId = 1; // Current user ID (in real app, get from auth context)

  const { data: listings = [] } = useUserListings(userId);
  const updateListingMutation = useUpdateListing();
  const deleteListingMutation = useDeleteListing();

  const filteredListings = listings.filter((listing) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return listing.status === "active";
    if (activeFilter === "sold") return listing.status === "sold";
    return true;
  });

  const userStats = {
    listings: listings.length,
    sold: listings.filter(l => l.status === "sold").length,
    rating: 4.9,
  };

  const handleUpdateListingStatus = (id: number, status: string) => {
    updateListingMutation.mutate({ id, updates: { status } });
  };

  const handleDeleteListing = (id: number) => {
    if (confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) {
      deleteListingMutation.mutate(id);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pl-PL");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Jan Kowalski</h2>
                <p className="text-gray-600 mb-4 flex items-center justify-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Warszawa
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <div className="text-2xl font-bold text-primary">{userStats.listings}</div>
                    <div className="text-sm text-gray-500">Ogłoszeń</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{userStats.sold}</div>
                    <div className="text-sm text-gray-500">Sprzedanych</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{userStats.rating}</div>
                    <div className="text-sm text-gray-500">Ocena</div>
                  </div>
                </div>
                
                <Button className="w-full">Edytuj profil</Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Szybkie akcje</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Ulubione ogłoszenia</span>
                  <Badge variant="secondary" className="ml-auto">3</Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span>Ostatnio oglądane</span>
                  <Badge variant="secondary" className="ml-auto">7</Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span>Ustawienia</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700">
                  <LogOut className="h-4 w-4" />
                  <span>Wyloguj się</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* My Listings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Moje ogłoszenia</CardTitle>
                  <div className="flex gap-2">
                    {filterOptions.map((option) => (
                      <Button
                        key={option.id}
                        variant={activeFilter === option.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter(option.id)}
                      >
                        {option.label} ({option.count})
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredListings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {activeFilter === "all" 
                      ? "Nie masz jeszcze żadnych ogłoszeń" 
                      : `Brak ogłoszeń w kategorii "${filterOptions.find(f => f.id === activeFilter)?.label}"`
                    }
                  </div>
                ) : (
                  filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <img
                        src={listing.images?.[0] || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop`}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{listing.title}</h4>
                        <p className="text-primary font-semibold">{listing.price} zł</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {listing.views || 0} wyświetleń
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {listing.favorites || 0} polubiło
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            0 wiadomości
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={listing.status === "active" ? "default" : "secondary"}
                          className={cn(
                            listing.status === "active" && "bg-green-100 text-green-800",
                            listing.status === "sold" && "bg-gray-100 text-gray-600"
                          )}
                        >
                          {listing.status === "active" ? "Aktywne" : "Sprzedane"}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edytuj
                            </DropdownMenuItem>
                            {listing.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => handleUpdateListingStatus(listing.id, "paused")}
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Wstrzymaj
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleUpdateListingStatus(listing.id, "active")}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Wznów ogłoszenie
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Usuń
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}

                {/* Pagination */}
                {filteredListings.length > 0 && (
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Pokazuję 1-{filteredListings.length} z {listings.length} ogłoszeń
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Poprzednia
                      </Button>
                      <Button size="sm">1</Button>
                      <Button variant="outline" size="sm">
                        2
                      </Button>
                      <Button variant="outline" size="sm">
                        Następna
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
