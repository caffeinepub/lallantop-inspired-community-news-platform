import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Article {
    id: UniqueId;
    title: string;
    titleHindi: string;
    body: string;
    authorRole: string;
    publishedAt: Timestamp;
    isBreaking: boolean;
    author: string;
    imageUrl: string;
    isFeatured: boolean;
    category: ArticleCategory;
    bodyHindi: string;
}
export type Timestamp = bigint;
export interface Comment {
    id: UniqueId;
    body: string;
    createdAt: Timestamp;
    authorName: string;
    articleId?: UniqueId;
    authorPrincipal: Principal;
    postId?: UniqueId;
}
export type UniqueId = bigint;
export interface UserRegistryEntry {
    role: UserRole;
    autoId: string;
}
export interface MediaItem {
    id: UniqueId;
    title: string;
    thumbnailUrl: string;
    publishedAt: Timestamp;
    mediaType: MediaType;
    embedUrl: string;
}
export interface UserProfile {
    bio: string;
    name: string;
    avatarUrl: string;
}
export interface CitizenPost {
    id: UniqueId;
    status: CitizenPostStatus;
    title: string;
    body: string;
    authorName: string;
    publishedAt: Timestamp;
    imageUrl: string;
    category: ArticleCategory;
    authorPrincipal: Principal;
}
export enum ArticleCategory {
    entertainment = "entertainment",
    technology = "technology",
    business = "business",
    india = "india",
    sports = "sports",
    world = "world"
}
export enum CitizenPostStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum MediaType {
    video = "video",
    reel = "reel",
    podcast = "podcast"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(articleId: UniqueId | null, postId: UniqueId | null, authorName: string, body: string): Promise<UniqueId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRoleWithAutoId(user: Principal, role: UserRole): Promise<string>;
    createArticle(title: string, titleHindi: string, body: string, bodyHindi: string, category: ArticleCategory, author: string, authorRole: string, imageUrl: string, isBreaking: boolean, isFeatured: boolean): Promise<UniqueId>;
    createCitizenPost(title: string, body: string, category: ArticleCategory, authorName: string, imageUrl: string): Promise<UniqueId>;
    deleteArticle(id: UniqueId): Promise<void>;
    getArticles(): Promise<Array<Article>>;
    getArticlesByCategory(category: ArticleCategory): Promise<Array<Article>>;
    getBreakingNews(): Promise<Array<Article>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCitizenPosts(): Promise<Array<CitizenPost>>;
    getCommentsByArticle(articleId: UniqueId): Promise<Array<Comment>>;
    getCommentsByPost(postId: UniqueId): Promise<Array<Comment>>;
    getFeaturedArticles(): Promise<Array<Article>>;
    getMediaItems(): Promise<Array<MediaItem>>;
    getMyProfile(): Promise<UserRegistryEntry | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRegistry(): Promise<Array<{
        principal: Principal;
        role: UserRole;
        autoId: string;
    }>>;
    initialize(): Promise<void>;
    isAdminCaller(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isEditorCaller(): Promise<boolean>;
    isInitializedActor(): Promise<boolean>;
    revokeRole(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateArticleStatus(postId: UniqueId, newStatus: CitizenPostStatus): Promise<void>;
}
