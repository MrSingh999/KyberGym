import React from "react";
import { Search, Filter, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { useMemberDirectoryStore } from "../store/useMemberDirectoryStore";

export function MembersToolbar() {
  const { searchQuery, setSearchQuery } = useMemberDirectoryStore();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center w-full mb-6">
      
      {/* Search Input (Debounced by the store or hook in production) */}
      <div className="w-full sm:max-w-xs lg:max-w-md">
        <SearchInput
          placeholder="Search members by name, email, or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery("")}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button variant="outline" className="flex-1 sm:flex-none">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button className="flex-1 sm:flex-none">
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

    </div>
  );
}
