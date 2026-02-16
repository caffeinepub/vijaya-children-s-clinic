import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type AppointmentRequest = {
    parentName : Text;
    childName : Text;
    childAge : Nat;
    phoneNumber : Text;
    email : ?Text;
    preferredDate : Int;
    preferredTime : Text;
    reason : Text;
    submissionTime : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  var appointments = List.empty<AppointmentRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  // User profile management functions
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

  // Function to create a new appointment request
  // No authorization check - anyone (including guests) can book appointments
  public shared ({ caller }) func createAppointment(request : AppointmentRequest) : async () {
    appointments.add(request);
  };

  // Function to list all appointment requests, restricted to clinic staff (admins)
  public query ({ caller }) func listAppointments() : async [AppointmentRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only clinic staff can view appointments");
    };
    appointments.toArray();
  };
};
