"use client";
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function NotificationCenter() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <Bell className="w-8 h-8 mb-3 opacity-30" />
          <p className="text-sm">No notifications yet</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
