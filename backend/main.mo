import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
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

  type CitizenPostStatus = { #pending; #approved; #rejected };

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

  // User profile type required by the frontend
  type UserProfile = {
    name : Text;
    bio : Text;
    avatarUrl : Text;
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextId = 1;

  let articles = Map.empty<UniqueId, Article>();
  let citizenPosts = Map.empty<UniqueId, CitizenPost>();
  let comments = Map.empty<UniqueId, Comment>();
  let mediaItems = Map.empty<UniqueId, MediaItem>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var isInitialized = false;

  // Public Functions
  public shared ({ caller }) func initialize() : async () {
    AccessControl.initialize(accessControlState, caller, "", "");
    if (isInitialized) { Runtime.trap("Already initialized") };
    isInitialized := true;
    seedArticles();
    seedMediaItems();
  };

  // Helper to get next unique ID
  func getNextId() : UniqueId {
    let id = nextId;
    nextId += 1;
    id;
  };

  // ── User Profile Functions (required by frontend) ──────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Admins can view any profile; users can only view their own
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

  // ── Role Management ────────────────────────────────────────────────────────

  public query ({ caller }) func getRoleForPrincipal(user : Principal) : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, user);
  };

  // assignRole is provided by MixinAuthorization (admin-only guard is inside
  // AccessControl.assignRole itself, so no extra check is needed here).

  public query ({ caller }) func isAdminCaller() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func isEditorCaller() : async Bool {
    // Editors are mapped to the #user role in the access-control module
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  // ── Queries ────────────────────────────────────────────────────────────────

  // Public read – no auth required
  public query func getArticles() : async [Article] {
    articles.values().toArray();
  };

  public query func getArticlesByCategory(category : ArticleCategory) : async [Article] {
    articles.values().toArray().filter(func(a) { a.category == category });
  };

  public query func getBreakingNews() : async [Article] {
    articles.values().toArray().filter(func(a) { a.isBreaking });
  };

  public query func getFeaturedArticles() : async [Article] {
    articles.values().toArray().filter(func(a) { a.isFeatured });
  };

  public query func getCitizenPosts() : async [CitizenPost] {
    citizenPosts.values().toArray();
  };

  public query func getCommentsByArticle(articleId : UniqueId) : async [Comment] {
    comments.values().toArray().filter(func(c) { c.articleId == ?articleId });
  };

  public query func getMediaItems() : async [MediaItem] {
    mediaItems.values().toArray();
  };

  // ── Mutations ──────────────────────────────────────────────────────────────

  // Citizen posts require a logged-in (non-anonymous) user
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

  // Comments require a logged-in (non-anonymous) user
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

  // Article creation is admin-only (as specified in the implementation plan)
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

  // Citizen-post moderation is available to admins and editors (#user role)
  public shared ({ caller }) func updateArticleStatus(
    postId : UniqueId,
    newStatus : CitizenPostStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only admins or editors can update post status");
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

  // ── Seed Data ──────────────────────────────────────────────────────────────

  func seedArticles() {
    let initialArticles = [
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
    ];

    for (article in initialArticles.values()) {
      articles.add(article.id, article);
    };
  };

  func seedMediaItems() {
    let initialMedia = [
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
    ];

    for (media in initialMedia.values()) {
      mediaItems.add(media.id, media);
    };
  };
};
