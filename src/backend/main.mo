import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

// Data migration must happen before any data is used
(with migration = Migration.run)
actor {
  public type UniqueId = Nat;
  public type Timestamp = Time.Time;

  // Enums & Types
  public type ArticleCategory = {
    #india;
    #world;
    #sports;
    #entertainment;
    #technology;
    #business;
  };

  public type MediaType = {
    #video;
    #podcast;
    #reel;
  };

  // Models
  public type Article = {
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

  public type CitizenPostStatus = { #pending; #approved; #rejected };

  public type CitizenPost = {
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

  public type Comment = {
    id : UniqueId;
    articleId : ?UniqueId;
    postId : ?UniqueId;
    authorPrincipal : Principal;
    authorName : Text;
    body : Text;
    createdAt : Timestamp;
  };

  public type MediaItem = {
    id : UniqueId;
    mediaType : MediaType;
    title : Text;
    embedUrl : Text;
    thumbnailUrl : Text;
    publishedAt : Timestamp;
  };

  public type UserProfile = {
    name : Text;
    bio : Text;
    avatarUrl : Text;
  };

  public type UserRegistryEntry = {
    autoId : Text;
    role : AccessControl.UserRole;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextId = 1;
  var userRegistryCounter : Nat = 0;

  let articles = Map.empty<UniqueId, Article>();
  let citizenPosts = Map.empty<UniqueId, CitizenPost>();
  let comments = Map.empty<UniqueId, Comment>();
  let mediaItems = Map.empty<UniqueId, MediaItem>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userRegistry = Map.empty<Principal, UserRegistryEntry>();

  var isInitialized = false;

  // ── Public Functions ───────────────────────────────────────────────

  public shared ({ caller }) func initialize() : async () {
    if (isInitialized) { Runtime.trap("Already initialized") };

    isInitialized := true;
    seedArticles();
    seedMediaItems();
  };

  func getNextId() : UniqueId {
    let id = nextId;
    nextId += 1;
    id;
  };

  // ── User Profile Functions ─────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Role Management ────────────────────────────────────────────────

  public shared ({ caller }) func assignRoleWithAutoId(user : Principal, role : AccessControl.UserRole) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };

    let autoId = switch (role) {
      case (#admin) { "admin_" # Nat.toText(userRegistryCounter) };
      case (#user) { "user_" # Nat.toText(userRegistryCounter) };
      case (#guest) { "guest_" # Nat.toText(userRegistryCounter) };
    };

    let entry : UserRegistryEntry = { autoId; role };
    userRegistry.add(user, entry);

    // Actually assign the role in the access control system
    AccessControl.assignRole(accessControlState, caller, user, role);

    userRegistryCounter += 1;
    autoId;
  };

  public query ({ caller }) func getMyProfile() : async ?UserRegistryEntry {
    userRegistry.get(caller);
  };

  public shared ({ caller }) func revokeRole(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can revoke roles");
    };
    userRegistry.remove(user);
    // Note: AccessControl module doesn't expose a revoke function,
    // so we assign guest role which is the default
    AccessControl.assignRole(accessControlState, caller, user, #guest);
  };

  public query ({ caller }) func getUserRegistry() : async [{ principal : Principal; autoId : Text; role : AccessControl.UserRole }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access the user registry");
    };

    let entries = List.empty<{ principal : Principal; autoId : Text; role : AccessControl.UserRole }>();
    for ((principal, entry) in userRegistry.entries()) {
      entries.add({
        principal;
        autoId = entry.autoId;
        role = entry.role;
      });
    };
    entries.toArray();
  };

  public query ({ caller }) func isAdminCaller() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func isEditorCaller() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  // ── Queries ────────────────────────────────────────────────────────

  public query func getArticles() : async [Article] {
    articles.values().toArray();
  };

  public query func getArticlesByCategory(category : ArticleCategory) : async [Article] {
    articles.values().toArray().filter(func(a : Article) : Bool { a.category == category });
  };

  public query func getBreakingNews() : async [Article] {
    articles.values().toArray().filter(func(a : Article) : Bool { a.isBreaking });
  };

  public query func getFeaturedArticles() : async [Article] {
    articles.values().toArray().filter(func(a : Article) : Bool { a.isFeatured });
  };

  public query func getCitizenPosts() : async [CitizenPost] {
    citizenPosts.values().toArray();
  };

  public query func getCommentsByArticle(articleId : UniqueId) : async [Comment] {
    comments.values().toArray().filter(func(c : Comment) : Bool { c.articleId == ?articleId });
  };

  public query func getCommentsByPost(postId : UniqueId) : async [Comment] {
    comments.values().toArray().filter(func(c : Comment) : Bool { c.postId == ?postId });
  };

  public query func getMediaItems() : async [MediaItem] {
    mediaItems.values().toArray();
  };

  // ── Mutations ──────────────────────────────────────────────────────

  public shared ({ caller }) func createCitizenPost(
    title : Text,
    body : Text,
    category : ArticleCategory,
    authorName : Text,
    imageUrl : Text,
  ) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create citizen posts");
    };
    let id = getNextId();
    let post : CitizenPost = {
      id;
      title;
      body;
      category;
      authorPrincipal = caller;
      authorName;
      imageUrl;
      publishedAt = Time.now();
      status = #pending;
    };
    citizenPosts.add(id, post);
    id;
  };

  public shared ({ caller }) func addComment(
    articleId : ?UniqueId,
    postId : ?UniqueId,
    authorName : Text,
    body : Text,
  ) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can add comments");
    };
    let id = getNextId();
    let comment : Comment = {
      id;
      articleId;
      postId;
      authorPrincipal = caller;
      authorName;
      body;
      createdAt = Time.now();
    };
    comments.add(id, comment);
    id;
  };

  public shared ({ caller }) func createArticle(
    title : Text,
    titleHindi : Text,
    body : Text,
    bodyHindi : Text,
    category : ArticleCategory,
    author : Text,
    authorRole : Text,
    imageUrl : Text,
    isBreaking : Bool,
    isFeatured : Bool,
  ) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create articles");
    };
    let id = getNextId();
    let article : Article = {
      id;
      title;
      titleHindi;
      body;
      bodyHindi;
      category;
      author;
      authorRole;
      imageUrl;
      publishedAt = Time.now();
      isBreaking;
      isFeatured;
    };
    articles.add(id, article);
    id;
  };

  public shared ({ caller }) func deleteArticle(id : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete articles");
    };
    articles.remove(id);
  };

  public shared ({ caller }) func updateArticleStatus(
    postId : UniqueId,
    newStatus : CitizenPostStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update post status");
    };
    switch (citizenPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let updatedPost : CitizenPost = {
          post with status = newStatus;
        };
        citizenPosts.add(postId, updatedPost);
      };
    };
  };

  // ── Seed Data ──────────────────────────────────────────────────────

  func seedArticles() {
    let epsteinBody = "In January 2026, a federal court unsealed over 900 pages of documents related to Jeffrey Epstein's criminal activities, revealing a disturbing pattern of abuse involving minors and powerful individuals across multiple jurisdictions. The files expose not only the scope of Epstein's trafficking network but also systemic failures in child protection worldwide.\n\nAccording to UNICEF, approximately 138 million children globally are engaged in child labor, with 38% of all human trafficking victims being children. The Epstein case highlights a critical gap: the absence of a global auditor to monitor and enforce child protection standards across borders.\n\nKey recommendations include:\n1. Establishing UNICEF as the global auditor for child protection with enforcement powers\n2. Creating international protocols for cross-border investigation of child exploitation\n3. Closing jurisdiction gaps that allow perpetrators to evade justice\n4. Implementing mandatory reporting systems for all institutions serving children\n5. Strengthening victim support and rehabilitation programs\n\nThe international community must act decisively to prevent future cases like Epstein's and protect the world's most vulnerable population.";

    let initialArticles = [
      {
        id = getNextId();
        title = "The Epstein Files & The Global Justice Gap: Why 1 in 3 Victims is a Child";
        titleHindi = "एपस्टीन फ़ाइलें और वैश्विक न्याय अंतराल: 3 में से 1 पीड़ित बच्चा क्यों?";
        body = epsteinBody;
        bodyHindi = "जनवरी 2026 में, एक संघीय अदालत ने जेफरी एपस्टीन की आपराधिक गतिविधियों से संबंधित 900 से अधिक पृष्ठों के दस्तावेज़ अनसील किए, जिसमें नाबालिगों और कई क्षेत्राधिकारों में शक्तिशाली व्यक्तियों से जुड़े दुर्व्यवहार का एक परेशान करने वाला पैटर्न सामने आया।";
        category = #world;
        author = "Pawnesh Kumar Singh";
        authorRole = "Founder & CEO";
        imageUrl = "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "India's Economic Growth Surges";
        titleHindi = "भारत की आर्थिक वृद्धि में उछाल";
        body = "India has recorded a significant economic growth this quarter, driven by strong performance in manufacturing and services sectors. Analysts predict continued momentum through the fiscal year.";
        bodyHindi = "भारत ने इस तिमाही में महत्वपूर्ण आर्थिक वृद्धि दर्ज की है, जो विनिर्माण और सेवा क्षेत्रों के मजबूत प्रदर्शन से प्रेरित है। विश्लेषकों को वित्त वर्ष के दौरान निरंतर गति की उम्मीद है।";
        category = #india;
        author = "Priya Sharma";
        authorRole = "Senior Editor";
        imageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "Tech Innovations Reshaping India in 2024";
        titleHindi = "2024 में भारत को नया रूप देने वाले तकनीकी नवाचार";
        body = "The year 2024 has seen remarkable technological innovations across India, from AI-powered agriculture to fintech breakthroughs that are transforming rural banking.";
        bodyHindi = "2024 में भारत में उल्लेखनीय तकनीकी नवाचार देखे गए हैं, एआई-संचालित कृषि से लेकर फिनटेक सफलताओं तक जो ग्रामीण बैंकिंग को बदल रही हैं।";
        category = #technology;
        author = "Rahul Verma";
        authorRole = "Tech Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "World Leaders Gather for G20 Summit";
        titleHindi = "जी20 शिखर सम्मेलन के लिए विश्व नेता एकत्रित";
        body = "Global political dynamics are shifting rapidly as world leaders convene for the G20 summit to address pressing issues including climate change, trade, and geopolitical tensions.";
        bodyHindi = "वैश्विक राजनीतिक गतिशीलता तेजी से बदल रही है क्योंकि विश्व नेता जलवायु परिवर्तन, व्यापार और भू-राजनीतिक तनाव सहित महत्वपूर्ण मुद्दों को संबोधित करने के लिए जी20 शिखर सम्मेलन में एकत्रित हो रहे हैं।";
        category = #world;
        author = "Anita Desai";
        authorRole = "International Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "India Wins Cricket World Cup in Thrilling Final";
        titleHindi = "भारत ने रोमांचक फाइनल में क्रिकेट वर्ल्ड कप जीता";
        body = "The Cricket World Cup has delivered its most exciting final in decades as India clinched the title in a nail-biting last-over finish against Australia at the iconic Melbourne Cricket Ground.";
        bodyHindi = "क्रिकेट वर्ल्ड कप ने दशकों में अपना सबसे रोमांचक फाइनल दिया क्योंकि भारत ने मेलबर्न क्रिकेट ग्राउंड पर ऑस्ट्रेलिया के खिलाफ रोमांचक अंतिम ओवर में खिताब जीता।";
        category = #sports;
        author = "Vikram Singh";
        authorRole = "Sports Editor";
        imageUrl = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "Bollywood Blockbusters Set New Box Office Records";
        titleHindi = "बॉलीवुड ब्लॉकबस्टर ने बॉक्स ऑफिस के नए रिकॉर्ड बनाए";
        body = "Bollywood has announced a series of new movies that are already breaking pre-booking records. The upcoming slate features major stars and high-budget productions expected to dominate screens worldwide.";
        bodyHindi = "बॉलीवुड ने कई नई फ़िल्मों की घोषणा की है जो पहले से ही प्री-बुकिंग रिकॉर्ड तोड़ रही हैं। आगामी स्लेट में प्रमुख सितारे और उच्च-बजट प्रोडक्शन शामिल हैं जो दुनिया भर में स्क्रीन पर छाने की उम्मीद है।";
        category = #entertainment;
        author = "Meera Kapoor";
        authorRole = "Entertainment Reporter";
        imageUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "Sensex Crosses 80,000 Mark for First Time";
        titleHindi = "सेंसेक्स पहली बार 80,000 के पार";
        body = "Experts provide insights into the current stock market trends as the Sensex crosses the historic 80,000 mark for the first time, driven by strong FII inflows and robust corporate earnings.";
        bodyHindi = "विशेषज्ञ वर्तमान शेयर बाज़ार प्रवृत्तियों पर जानकारी दे रहे हैं क्योंकि सेंसेक्स पहली बार ऐतिहासिक 80,000 के पार पहुंचा, जो मजबूत एफआईआई प्रवाह और मजबूत कॉर्पोरेट आय से प्रेरित है।";
        category = #business;
        author = "Suresh Patel";
        authorRole = "Business Analyst";
        imageUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "India Leads Global Renewable Energy Transition";
        titleHindi = "भारत वैश्विक नवीकरणीय ऊर्जा परिवर्तन में अग्रणी";
        body = "Renewable energy sources are gaining momentum in India as the country surpasses its 2030 solar energy targets six years ahead of schedule, positioning itself as a global clean energy leader.";
        bodyHindi = "भारत में नवीकरणीय ऊर्जा स्रोत गति पकड़ रहे हैं क्योंकि देश अपने 2030 के सौर ऊर्जा लक्ष्यों को छह साल पहले ही पार कर गया है, जो खुद को वैश्विक स्वच्छ ऊर्जा नेता के रूप में स्थापित कर रहा है।";
        category = #technology;
        author = "Kavita Nair";
        authorRole = "Science Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "Chandrayaan-4 Mission Achieves Lunar Orbit";
        titleHindi = "चंद्रयान-4 मिशन ने चंद्र कक्षा हासिल की";
        body = "India has successfully launched its Chandrayaan-4 mission, which has now achieved lunar orbit. The mission aims to collect and return lunar soil samples to Earth for the first time in Indian space history.";
        bodyHindi = "भारत ने अपना चंद्रयान-4 मिशन सफलतापूर्वक लॉन्च किया है, जिसने अब चंद्र कक्षा हासिल कर ली है। मिशन का लक्ष्य भारतीय अंतरिक्ष इतिहास में पहली बार चंद्र मिट्टी के नमूने पृथ्वी पर वापस लाना है।";
        category = #india;
        author = "Dr. Arun Kumar";
        authorRole = "Science Editor";
        imageUrl = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "IMF Revises Global Growth Forecast Upward";
        titleHindi = "आईएमएफ ने वैश्विक विकास पूर्वानुमान ऊपर की ओर संशोधित किया";
        body = "Economists share their views on the global economy as the IMF revises its growth forecast upward, citing resilient consumer spending in emerging markets and easing inflation pressures in developed economies.";
        bodyHindi = "अर्थशास्त्री वैश्विक अर्थव्यवस्था पर अपने विचार साझा कर रहे हैं क्योंकि आईएमएफ ने अपने विकास पूर्वानुमान को ऊपर की ओर संशोधित किया है।";
        category = #business;
        author = "Neha Gupta";
        authorRole = "Economics Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "Paris Olympics 2024: India's Best Performance Ever";
        titleHindi = "पेरिस ओलंपिक 2024: भारत का अब तक का सर्वश्रेष्ठ प्रदर्शन";
        body = "Countries are gearing up for the upcoming Olympics as India prepares its largest-ever contingent. Indian athletes have been breaking national records in the lead-up to the Paris Games.";
        bodyHindi = "देश आगामी ओलंपिक्स के लिए तैयार हो रहे हैं क्योंकि भारत अपना अब तक का सबसे बड़ा दल तैयार कर रहा है। भारतीय एथलीट पेरिस खेलों की तैयारी में राष्ट्रीय रिकॉर्ड तोड़ रहे हैं।";
        category = #sports;
        author = "Arjun Mehta";
        authorRole = "Sports Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "Amazon Deforestation Reaches Critical Levels";
        titleHindi = "अमेज़न वनों की कटाई गंभीर स्तर पर पहुंची";
        body = "NGOs are working towards environmental conservation as new satellite data reveals Amazon deforestation has reached critical levels, prompting urgent calls for international intervention.";
        bodyHindi = "एनजीओज पर्यावरण संरक्षण के लिए काम कर रहे हैं क्योंकि नए उपग्रह डेटा से पता चलता है कि अमेज़न वनों की कटाई गंभीर स्तर पर पहुंच गई है।";
        category = #world;
        author = "Sunita Rao";
        authorRole = "Environment Reporter";
        imageUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "India's Startup Ecosystem Attracts Record FDI";
        titleHindi = "भारत के स्टार्टअप इकोसिस्टम ने रिकॉर्ड एफडीआई आकर्षित किया";
        body = "Businesses are rapidly adopting digital technologies as India's startup ecosystem attracts record foreign direct investment, with over 100 new unicorns emerging in the past year alone.";
        bodyHindi = "व्यवसाय तेजी से डिजिटल तकनीकों को अपना रहे हैं क्योंकि भारत के स्टार्टअप इकोसिस्टम ने रिकॉर्ड विदेशी प्रत्यक्ष निवेश आकर्षित किया है।";
        category = #business;
        author = "Rohit Joshi";
        authorRole = "Business Reporter";
        imageUrl = "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "AIIMS Researchers Develop Breakthrough Cancer Vaccine";
        titleHindi = "एम्स शोधकर्ताओं ने कैंसर वैक्सीन में सफलता हासिल की";
        body = "Researchers at AIIMS have achieved a significant medical breakthrough with a new cancer vaccine that has shown 90% efficacy in early clinical trials, offering hope to millions of patients.";
        bodyHindi = "एम्स के शोधकर्ताओं ने एक नई कैंसर वैक्सीन के साथ महत्वपूर्ण चिकित्सा सफलता हासिल की है जिसने प्रारंभिक नैदानिक परीक्षणों में 90% प्रभावकारिता दिखाई है।";
        category = #technology;
        author = "Dr. Priya Menon";
        authorRole = "Health Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "PM Launches Smart Cities Mission Phase 3";
        titleHindi = "पीएम ने स्मार्ट सिटीज मिशन चरण 3 लॉन्च किया";
        body = "Local governments are launching new initiatives as the Prime Minister unveils Phase 3 of the Smart Cities Mission, targeting 50 additional cities with investments in digital infrastructure and sustainable urban development.";
        bodyHindi = "स्थानीय सरकारें नई पहल शुरू कर रही हैं क्योंकि प्रधानमंत्री ने स्मार्ट सिटीज मिशन के चरण 3 का अनावरण किया है।";
        category = #india;
        author = "Deepak Sharma";
        authorRole = "Political Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "COP30 Climate Summit Reaches Historic Agreement";
        titleHindi = "COP30 जलवायु शिखर सम्मेलन ने ऐतिहासिक समझौता किया";
        body = "Leaders discuss solutions at the climate change summit as COP30 concludes with a historic agreement committing 195 nations to net-zero emissions by 2045, the most ambitious climate deal ever signed.";
        bodyHindi = "नेता जलवायु परिवर्तन सम्मेलन में समाधान पर चर्चा कर रहे हैं क्योंकि COP30 एक ऐतिहासिक समझौते के साथ समाप्त हुआ जो 195 देशों को 2045 तक शुद्ध-शून्य उत्सर्जन के लिए प्रतिबद्ध करता है।";
        category = #world;
        author = "Aisha Khan";
        authorRole = "World Affairs Editor";
        imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "India's Space Ambitions Soar";
        titleHindi = "भारत की अंतरिक्ष महत्वाकांक्षाएँ बढ़ीं";
        body = "India has announced plans for new space missions, including a manned mission to Mars by 2030 and expanded satellite launches.";
        bodyHindi = "भारत ने 2030 तक मंगल ग्रह पर मानव मिशन समेत नए अंतरिक्ष अभियानों की योजना बनाई है।";
        category = #india;
        author = "Ritu Malhotra";
        authorRole = "Science Editor";
        imageUrl = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "Digital India Expands Broadband Access";
        titleHindi = "डिजिटल इंडिया ने ब्रॉडबैंड एक्सेस का विस्तार किया";
        body = "The government has launched a new initiative to provide broadband internet to rural villages, improving connectivity and access to digital services.";
        bodyHindi = "सरकार ने ग्रामीण गांवों में ब्रॉडबैंड इंटरनेट प्रदान करने की नई पहल शुरू की है।";
        category = #india;
        author = "Ajay Singh";
        authorRole = "Technology Editor";
        imageUrl = "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "Global Vaccination Drives Reach New Milestone";
        titleHindi = "वैश्विक टीकाकरण अभियानों में नई उपलब्धि";
        body = "International organizations have reported record progress in vaccination drives, reaching remote regions and improving global health outcomes.";
        bodyHindi = "अंतर्राष्ट्रीय संगठनों ने दूरदराज के क्षेत्रों में टीकाकरण अभियानों में रिकॉर्ड प्रगति की सूचना दी है।";
        category = #world;
        author = "Emily Watson";
        authorRole = "Health Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "World Education Summit Promotes Learning Equality";
        titleHindi = "विश्व शिक्षा शिखर सम्मेलन ने शिक्षा समानता को बढ़ावा दिया";
        body = "Leaders from around the globe have gathered to discuss initiatives aimed at promoting equal access to quality education.";
        bodyHindi = "दुनिया भर के नेता गुणवत्तापूर्ण शिक्षा के समान पहुंच को बढ़ावा देने के लिए पहलों पर चर्चा करने के लिए एकत्रित हुए हैं।";
        category = #world;
        author = "Lina Garcia";
        authorRole = "Education Reporter";
        imageUrl = "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "India Shines in International Cricket League";
        titleHindi = "अंतर्राष्ट्रीय क्रिकेट लीग में भारत ने चमक बिखेरी";
        body = "Indian cricket players have shown outstanding performance in the latest international league, bringing home several awards.";
        bodyHindi = "भारतीय क्रिकेट खिलाड़ियों ने नवीनतम अंतर्राष्ट्रीय लीग में उत्कृष्ट प्रदर्शन किया।";
        category = #sports;
        author = "Rajesh Patel";
        authorRole = "Sports Analyst";
        imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "Olympic Games: Indian Contingent Gears Up";
        titleHindi = "ओलंपिक खेलों के लिए भारतीय दल तैयार";
        body = "Indian athletes are in spirit and readiness as they prepare for upcoming Olympic competitions.";
        bodyHindi = "भारतीय एथलीट आगामी ओलंपिक प्रतियोगिताओं की तैयारी में पूरी उत्साह और तत्परता दिखा रहे हैं।";
        category = #sports;
        author = "Meera Dubey";
        authorRole = "Sports Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1519864600265-abb113f9c3e1?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "Bollywood Embraces Digital Film Releases";
        titleHindi = "बॉलीवुड ने डिजिटल फिल्म रिलीज़ को अपनाया";
        body = "With the changing landscape of cinema, Bollywood is increasingly embracing digital-first releases.";
        bodyHindi = "बदलते सिनेमा परिदृश्य के साथ, बॉलीवुड डिजिटल-फर्स्ट रिलीज़ को तेजी से अपना रहा है।";
        category = #entertainment;
        author = "Divya Sharma";
        authorRole = "Entertainment Reporter";
        imageUrl = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "Indie Music Scene Booms in India";
        titleHindi = "भारत में इंडी म्यूजिक सीन की शानदार बढ़ोतरी";
        body = "Independent music in India is booming with new artists entering the scene.";
        bodyHindi = "भारत में इंडिपेंडेंट म्यूजिक सेक्टर तेजी से बढ़ रहा है और नए कलाकार इसमें अपनी जगह बना रहे हैं।";
        category = #entertainment;
        author = "Rohan Jain";
        authorRole = "Music Analyst";
        imageUrl = "https://images.unsplash.com/photo-1488129320317-6d079724b4a7?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "India Leads in ICT Innovation";
        titleHindi = "आईसीटी नवाचारों में भारत अग्रणी";
        body = "India continues to lead in ICT (Information and Communication Technology) innovations, with new startups emerging across all fields.";
        bodyHindi = "भारत आईसीटी (सूचना और संचार प्रौद्योगिकी) नवाचारों में अग्रणी बनता जा रहा है।";
        category = #technology;
        author = "Sapna Rao";
        authorRole = "Tech Editor";
        imageUrl = "https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "Breakthroughs in AI Healthcare in India";
        titleHindi = "भारत में एआई हेल्थकेयर में बड़ी उपलब्धियां";
        body = "AI-powered healthcare solutions are making waves in India, providing faster diagnoses and personalized treatment plans.";
        bodyHindi = "एआई-आधारित हेल्थकेयर समाधान भारत में त्वरित निदान और व्यक्तिगत इलाज की दिशा निर्धारित कर रहे हैं।";
        category = #technology;
        author = "Manish Verma";
        authorRole = "Healthcare Correspondent";
        imageUrl = "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      },
      {
        id = getNextId();
        title = "India's E-Commerce Sector Grows Rapidly";
        titleHindi = "भारत का ई-कॉमर्स क्षेत्र तेजी से बढ़ा";
        body = "India's e-commerce sector is experiencing rapid growth, with more businesses and consumers moving online.";
        bodyHindi = "भारत का ई-कॉमर्स क्षेत्र तेज़ी से बढ़ रहा है, अधिक व्यवसाय और उपभोक्ता ऑनलाइन हो रहे हैं।";
        category = #business;
        author = "Kiran Joshi";
        authorRole = "Business Analyst";
        imageUrl = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800";
        publishedAt = Time.now();
        isBreaking = false;
        isFeatured = true;
      },
      {
        id = getNextId();
        title = "Financial Inclusion Reaches Rural India";
        titleHindi = "वित्तीय समावेशन ग्रामीण भारत तक पहुँचा";
        body = "Efforts to promote financial inclusion are making significant progress in rural India, with new banking and fintech initiatives.";
        bodyHindi = "ग्रामीण भारत में वित्तीय समावेशन को प्रोत्साहित करने के प्रयासों ने महत्वपूर्ण प्रगति की है।";
        category = #business;
        author = "Pooja Deshmukh";
        authorRole = "Economics Reporter";
        imageUrl = "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800";
        publishedAt = Time.now();
        isBreaking = true;
        isFeatured = false;
      }
    ];

    for (article in initialArticles.values()) {
      articles.add(article.id, article);
    };
  };

  func seedMediaItems() {
    let initialMedia = [
      // Existing media items
      {
        id = getNextId();
        mediaType = #video;
        title = "India's Technology Revolution Explained";
        embedUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";
        thumbnailUrl = "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #video;
        title = "Economic Growth: What It Means for You";
        embedUrl = "https://www.youtube.com/embed/9bZkp7q19f0";
        thumbnailUrl = "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #video;
        title = "Chandrayaan-4 Mission Highlights";
        embedUrl = "https://www.youtube.com/embed/ZRtdQ81jPUQ";
        thumbnailUrl = "https://img.youtube.com/vi/ZRtdQ81jPUQ/hqdefault.jpg";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #podcast;
        title = "Climate Change: India's Response";
        embedUrl = "https://open.spotify.com/episode/example1";
        thumbnailUrl = "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #podcast;
        title = "Political Analysis: 2024 Elections";
        embedUrl = "https://open.spotify.com/episode/example2";
        thumbnailUrl = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #podcast;
        title = "Business Insights: Startup India";
        embedUrl = "https://open.spotify.com/episode/example3";
        thumbnailUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #reel;
        title = "60-Second News: Today's Top Stories";
        embedUrl = "https://www.youtube.com/shorts/example1";
        thumbnailUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #reel;
        title = "Cricket Highlights in 60 Seconds";
        embedUrl = "https://www.youtube.com/shorts/example2";
        thumbnailUrl = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #video;
        title = "The Rise of Indian Startups";
        embedUrl = "https://www.youtube.com/embed/exampleStartup";
        thumbnailUrl = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #video;
        title = "India's Renewable Energy Initiatives";
        embedUrl = "https://www.youtube.com/embed/exampleRenewable";
        thumbnailUrl = "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #podcast;
        title = "Women Leaders in Tech";
        embedUrl = "https://open.spotify.com/episode/exampleWomenTech";
        thumbnailUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #podcast;
        title = "Wellness Trends in India";
        embedUrl = "https://open.spotify.com/episode/exampleWellness";
        thumbnailUrl = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #reel;
        title = "Fitness Tips in 30 Seconds";
        embedUrl = "https://www.youtube.com/shorts/exampleFitness";
        thumbnailUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800";
        publishedAt = Time.now();
      },
      {
        id = getNextId();
        mediaType = #reel;
        title = "Quick Tech News";
        embedUrl = "https://www.youtube.com/shorts/exampleTechNews";
        thumbnailUrl = "https://images.unsplash.com/photo-1519864600265-abb113f9c3e1?w=800";
        publishedAt = Time.now();
      }
    ];

    for (media in initialMedia.values()) {
      mediaItems.add(media.id, media);
    };
  };
};
