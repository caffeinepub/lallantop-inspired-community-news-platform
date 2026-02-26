module {
  type Actor = {
    nextId : Nat;
    userRegistryCounter : Nat;
    isInitialized : Bool;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
