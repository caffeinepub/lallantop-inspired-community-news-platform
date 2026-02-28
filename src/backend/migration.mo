import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
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

  type Article = {
    id : Nat;
    title : Text;
    titleHindi : Text;
    body : Text;
    bodyHindi : Text;
    category : ArticleCategory;
    author : Text;
    authorRole : Text;
    imageUrl : Text;
    publishedAt : Int;
    isBreaking : Bool;
    isFeatured : Bool;
  };

  type CitizenPostStatus = { #pending; #approved; #rejected };

  type CitizenPost = {
    id : Nat;
    title : Text;
    body : Text;
    category : ArticleCategory;
    authorPrincipal : Principal;
    authorName : Text;
    imageUrl : Text;
    publishedAt : Int;
    status : CitizenPostStatus;
  };

  type Comment = {
    id : Nat;
    articleId : ?Nat;
    postId : ?Nat;
    authorPrincipal : Principal;
    authorName : Text;
    body : Text;
    createdAt : Int;
  };

  type OldMediaItem = {
    id : Nat;
    mediaType : MediaType;
    title : Text;
    embedUrl : Text;
    thumbnailUrl : Text;
    publishedAt : Int;
  };

  type NewMediaItem = {
    id : Nat;
    mediaType : MediaType;
    title : Text;
    embedUrl : Text;
    thumbnailUrl : Text;
    publishedAt : Int;
    fileData : ?Text;
  };

  type UserProfile = {
    name : Text;
    bio : Text;
    avatarUrl : Text;
  };

  type UserRegistryEntry = {
    autoId : Text;
    role : {
      #admin;
      #user;
      #guest;
    };
  };

  type OldActor = {
    nextId : Nat;
    userRegistryCounter : Nat;
    articles : Map.Map<Nat, Article>;
    citizenPosts : Map.Map<Nat, CitizenPost>;
    comments : Map.Map<Nat, Comment>;
    mediaItems : Map.Map<Nat, OldMediaItem>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistry : Map.Map<Principal, UserRegistryEntry>;
    isInitialized : Bool;
  };

  type NewActor = {
    nextId : Nat;
    userRegistryCounter : Nat;
    articles : Map.Map<Nat, Article>;
    citizenPosts : Map.Map<Nat, CitizenPost>;
    comments : Map.Map<Nat, Comment>;
    mediaItems : Map.Map<Nat, NewMediaItem>;
    userProfiles : Map.Map<Principal, UserProfile>;
    userRegistry : Map.Map<Principal, UserRegistryEntry>;
    pageContent : Map.Map<Text, Text>;
    isInitialized : Bool;
  };

  public func run(old : OldActor) : NewActor {
    let newMediaItems = old.mediaItems.map<Nat, OldMediaItem, NewMediaItem>(
      func(_id, oldMediaItem) {
        { oldMediaItem with fileData = null };
      }
    );
    {
      old with
      mediaItems = newMediaItems;
      pageContent = Map.empty<Text, Text>();
    };
  };
};
