import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import List "mo:core/List";
import AccessControl "authorization/access-control";

module {
  type UniqueId = Nat;
  type Timestamp = Time.Time;

  // Enums & Types
  type ArticleCategory = {
    #india;
    #world;
    #sports;
    #entertainment;
    #technology;
    #business;
  };

  type MediaType = {
    #video;
    #podcast;
    #reel;
  };

  // Models
  type Article = {
    id : UniqueId;
    title : Text;
    titleHindi : Text;
    body : Text;
    bodyHindi : Text;
    category : ArticleCategory;
    author : Text;
    authorRole : Text;
    imageUrl : Text;
    publishedAt : Timestamp;
    isBreaking : Bool;
    isFeatured : Bool;
  };

  type CitizenPostStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type CitizenPost = {
    id : UniqueId;
    title : Text;
    body : Text;
    category : ArticleCategory;
    authorPrincipal : Principal;
    authorName : Text;
    imageUrl : Text;
    publishedAt : Timestamp;
    status : CitizenPostStatus;
  };

  type Comment = {
    id : UniqueId;
    articleId : ?UniqueId;
    postId : ?UniqueId;
    authorPrincipal : Principal;
    authorName : Text;
    body : Text;
    createdAt : Timestamp;
  };

  type MediaItem = {
    id : UniqueId;
    mediaType : MediaType;
    title : Text;
    embedUrl : Text;
    thumbnailUrl : Text;
    publishedAt : Timestamp;
  };

  type UserProfile = {
    name : Text;
    bio : Text;
    avatarUrl : Text;
  };

  type UserRegistryEntry = {
    autoId : Text;
    role : AccessControl.UserRole;
  };

  type OldActor = {
    nextId : Nat;
    userRegistryCounter : Nat;
    articles : Map.Map<UniqueId, Article>;
    citizenPosts : Map.Map<UniqueId, CitizenPost>;
    comments : Map.Map<UniqueId, Comment>;
    mediaItems : Map.Map<UniqueId, MediaItem>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistry : Map.Map<Principal, UserRegistryEntry>;
    isInitialized : Bool;
  };

  type NewActor = {
    nextId : Nat;
    userRegistryCounter : Nat;
    articles : Map.Map<UniqueId, Article>;
    citizenPosts : Map.Map<UniqueId, CitizenPost>;
    comments : Map.Map<UniqueId, Comment>;
    mediaItems : Map.Map<UniqueId, MediaItem>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistry : Map.Map<Principal, UserRegistryEntry>;
    isInitialized : Bool;
  };

  public func run(old : OldActor) : NewActor {
    { old with isInitialized = false };
  };
};
