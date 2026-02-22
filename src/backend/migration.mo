import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  public type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    staffUserMap : Map.Map<Text, { userId : Text; password : Text; email : ?Text; status : { #activated; #deactivated; #deleted } }>;
    authenticatedStaff : Map.Map<Principal, Text>;
    appointments : List.List<{ parentName : Text; childName : Text; childAge : Nat; phoneNumber : Text; email : ?Text; preferredDate : Int; preferredTime : Text; reason : Text; submissionTime : Int; status : { #pending; #confirmed; #completed; #cancelled } }>;
  };

  public type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    // Add initial staff user in migrated state
    let newStaff = {
      userId = "vijaya";
      password = "vijaya";
      email = null;
      status = #activated;
    };
    let updatedStaffUserMap = old.staffUserMap.clone();
    updatedStaffUserMap.add("vijaya", newStaff);
    { old with staffUserMap = updatedStaffUserMap };
  };
};
