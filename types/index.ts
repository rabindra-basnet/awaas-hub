export type UserRole = "buyer" | "seller" | "admin"

export interface User {
  id: string
  email: string
  name: string
  image?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Property {
  _id: string
  title: string
  description: string
  price: number
  location: string
  city: string
  state: string
  zipCode: string
  bedrooms: number
  bathrooms: number
  area: number
  amenities: string[]
  images: string[]
  sellerId: string
  createdAt: Date
  updatedAt: Date
  status: "available" | "sold" | "pending"
}

export interface Favorite {
  _id: string
  userId: string
  propertyId: string
  createdAt: Date
}

export interface Appointment {
  _id: string
  propertyId: string
  buyerId: string
  sellerId: string
  date: Date
  notes: string
  status: "pending" | "confirmed" | "cancelled"
  createdAt: Date
}
