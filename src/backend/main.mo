import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type AppointmentStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
    #review;
    #postponed;
    #preponed;
  };

  public type AppointmentRequest = {
    parentName : Text;
    childName : Text;
    childAge : Nat;
    phoneNumber : Text;
    email : ?Text;
    preferredDate : Int;
    preferredTime : Text;
    reason : Text;
    submissionTime : Int;
    status : AppointmentStatus;
  };

  public type StaffCredentials = {
    userId : Text;
    password : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type ActivationStatus = {
    #activated;
    #deactivated;
    #deleted;
  };

  public type StaffUser = {
    userId : Text;
    password : Text;
    email : ?Text;
    status : ActivationStatus;
  };

  public type StaffSession = {
    principal : Principal;
    userId : Text;
    timestamp : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Kept for stable variable compatibility with previous version
  let staffUserMap = Map.empty<Text, StaffUser>();
  let authenticatedStaff = Map.empty<Principal, StaffSession>();

  var appointments = List.empty<AppointmentRequest>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public function - anyone can create appointments
  public shared (_caller) func createAppointment(request : AppointmentRequest) : async () {
    appointments.add(request);
  };

  // Public query — authentication is handled in the frontend
  public query (_caller) func listAppointments() : async [AppointmentRequest] {
    appointments.toArray();
  };

  // Public update — authentication is handled in the frontend
  public shared (_caller) func updateAppointmentStatus(index : Nat, newStatus : AppointmentStatus) : async () {
    if (index >= appointments.size()) {
      Runtime.trap("Invalid appointment index");
    };

    let currentAppointments = appointments.toVarArray();
    let appointment = currentAppointments[index];

    let updatedAppointment : AppointmentRequest = {
      appointment with status = newStatus
    };

    currentAppointments[index] := updatedAppointment;
    appointments := List.fromVarArray(currentAppointments);
  };

  // Kept for API compatibility with previous version
  public shared ({ caller }) func authenticateStaff(_creds : StaffCredentials) : async Bool {
    ignore caller;
    true
  };

  public shared ({ caller }) func logoutStaff() : async () {
    ignore caller;
  };
};
