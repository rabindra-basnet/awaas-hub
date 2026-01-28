// View Page

export interface Property {
  _id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  aana?: number;           // Add this
  feet?: number;           // Add this
  images?: string[];       // Add this
  status?: "available" | "pending" | "sold";
  sellerId: string;
  isFavorite?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}