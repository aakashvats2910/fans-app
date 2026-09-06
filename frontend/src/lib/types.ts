export type Role = "FAN" | "CREATOR" | "ADMIN";

export interface UserSummary {
  id: number;
  username: string;
  displayName: string;
  role: Role;
  avatarUrl: string | null;
  bio: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface CreatorProfile {
  userId: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  coverImageUrl: string | null;
  subscriptionPrice: number;
  category: string | null;
  verified: boolean;
  subscriberCount: number;
  isSubscribed: boolean;
  isFollowing: boolean;
}

export interface PostMedia {
  id: number;
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
}

export interface Post {
  id: number;
  creatorId: number;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatarUrl: string | null;
  caption: string | null;
  locked: boolean;
  ppvPrice: number | null;
  hasAccess: boolean;
  media: PostMedia[];
  mediaCount: number;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  content: string;
  createdAt: string;
}

export interface Subscription {
  id: number;
  creatorId: number;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatarUrl: string | null;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  price: number;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
}

export interface Payment {
  id: number;
  payerId: number;
  payerUsername: string;
  payeeId: number;
  payeeUsername: string;
  amount: number;
  type: "SUBSCRIPTION" | "PPV_UNLOCK" | "TIP";
  status: string;
  provider: string;
  createdAt: string;
}

export interface AppNotification {
  id: number;
  type: string;
  actorId: number | null;
  actorUsername: string | null;
  actorAvatarUrl: string | null;
  referenceId: number | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalFans: number;
  totalCreators: number;
  totalPosts: number;
  totalActiveSubscriptions: number;
  totalRevenue: number;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}
