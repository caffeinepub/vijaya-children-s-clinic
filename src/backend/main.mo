import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
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

  public type UserProfile = {
    name : Text;
  };

  var appointments = List.empty<AppointmentRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();

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

  public shared ({ caller }) func createAppointment(request : AppointmentRequest) : async () {
    // No authorization check - any user including guests can create appointments
    appointments.add(request);
  };

  public query ({ caller }) func listAppointments() : async [AppointmentRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only clinic staff can view appointments");
    };
    appointments.toArray();
  };

  public shared ({ caller }) func updateAppointmentStatus(index : Nat, newStatus : AppointmentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only clinic staff can update appointment status");
    };

    if (index >= appointments.size()) {
      Runtime.trap("Invalid appointment index");
    };

    let currentAppointments = appointments.toVarArray();
    let appointment = currentAppointments[index];

    let updatedAppointment : AppointmentRequest = {
      appointment with
      status = newStatus;
    };

    currentAppointments[index] := updatedAppointment;
    appointments := List.fromVarArray(currentAppointments);
  };
};
