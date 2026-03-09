import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import List "mo:core/List";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    staffUserMap : Map.Map<Text, {
      userId : Text;
      password : Text;
      email : ?Text;
      status : { #activated; #deactivated; #deleted };
    }>;
    authenticatedStaff : Map.Map<Principal, Text>;
    appointments : List.List<{
      parentName : Text;
      childName : Text;
      childAge : Nat;
      phoneNumber : Text;
      email : ?Text;
      preferredDate : Int;
      preferredTime : Text;
      reason : Text;
      submissionTime : Int;
      status : { #pending; #confirmed; #completed; #cancelled };
    }>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    appointments : List.List<{
      parentName : Text;
      childName : Text;
      childAge : Nat;
      phoneNumber : Text;
      email : ?Text;
      preferredDate : Int;
      preferredTime : Text;
      reason : Text;
      submissionTime : Int;
      status : { #pending; #confirmed; #completed; #cancelled };
    }>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      appointments = old.appointments;
    };
  };
};
