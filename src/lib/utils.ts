
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRoomsByCategory(rooms: any[], category?: string) {
  if (!category || category === 'all') {
    return rooms;
  }
  
  return rooms.filter(room => room.category_type === category);
}

export function getUniqueCategories(rooms: any[]): string[] {
  const categories = new Set<string>();
  
  rooms.forEach(room => {
    if (room.category_type) {
      categories.add(room.category_type);
    }
  });
  
  return Array.from(categories);
}
