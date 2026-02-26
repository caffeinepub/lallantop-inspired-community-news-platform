import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // New types
  type NewActor = {
    userRegistryCounter : Nat;
    userRegistry : Map.Map<Principal, NewUserRegistryEntry>;
  };

  type NewUserRegistryEntry = {
    autoId : Text;
    role : NewUserRole;
  };

  type NewUserRole = {
    #admin;
    #user;
    #guest;
  };

  type OldActor = {};

  // Migration function without accessing non-existent fields in old state
  public func run(_: OldActor) : NewActor {
    let userRegistry = Map.empty<Principal, NewUserRegistryEntry>();
    {
      userRegistryCounter = 0;
      userRegistry;
    };
  };
};
