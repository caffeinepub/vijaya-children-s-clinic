import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
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
  let staffUserMap = Map.empty<Text, StaffUser>();

  // Track authenticated staff sessions in a Map<Principal, StaffSession>
  let authenticatedStaff = Map.empty<Principal, StaffSession>();

  var appointments = List.empty<AppointmentRequest>();

  // Helper function to check if caller is authenticated staff
  func isAuthenticatedStaff(caller : Principal) : Bool {
    authenticatedStaff.containsKey(caller);
  };

  // Helper function to check if credentials are valid
  func areCredentialsValid({ userId; password } : StaffCredentials) : Bool {
    userId == "vijaya" and password == "vijaya";
  };

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
  public shared ({ caller }) func createAppointment(request : AppointmentRequest) : async () {
    appointments.add(request);
  };

  // Staff authentication - allows any caller (including anonymous) to authenticate with hardcoded credentials
  public shared ({ caller }) func authenticateStaff({ userId; password } : StaffCredentials) : async Bool {
    // Validate credentials
    if (not areCredentialsValid({ userId; password })) {
      return false;
    };

    // Create a new staff session and store in the map
    let session : StaffSession = {
      principal = caller;
      userId;
      timestamp = 0;
    };
    authenticatedStaff.add(caller, session);
    true;
  };

  // Staff logout
  public shared ({ caller }) func logoutStaff() : async () {
    authenticatedStaff.remove(caller);
  };

  // Staff-only function - view appointments (authenticated staff OR admin)
  public query ({ caller }) func listAppointments() : async [AppointmentRequest] {
    if (not isAuthenticatedStaff(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only authenticated staff members can view appointments");
    };
    appointments.toArray();
  };

  // Staff-only function - update appointment status (authenticated staff OR admin)
  public shared ({ caller }) func updateAppointmentStatus(index : Nat, newStatus : AppointmentStatus) : async () {
    if (not isAuthenticatedStaff(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only authenticated staff members can update appointment status");
    };

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

  // Admin-only function - create staff user
  public shared ({ caller }) func createStaffUser(newUser : StaffUser) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create staff users");
    };
    if (staffUserMap.containsKey(newUser.userId)) {
      Runtime.trap("User already exists");
    };
    staffUserMap.add(newUser.userId, newUser);
  };

  // Admin-only function - update staff user (including password changes)
  public shared ({ caller }) func updateStaffUser(userId : Text, updatedUser : StaffUser) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update staff users");
    };
    if (not staffUserMap.containsKey(userId)) {
      Runtime.trap("User does not exist");
    };
    staffUserMap.add(userId, updatedUser);
  };

  // Admin-only function - deactivate staff user
  public shared ({ caller }) func deactivateStaffUser(userId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can deactivate staff users");
    };
    switch (staffUserMap.get(userId)) {
      case (null) {
        Runtime.trap("User does not exist");
      };
      case (?user) {
        let deactivated : StaffUser = { user with status = #deactivated };
        staffUserMap.add(userId, deactivated);

        // Remove any active sessions for this user
        for ((principal, staffUserId) in authenticatedStaff.entries()) {
          if (staffUserId.userId == userId) {
            authenticatedStaff.remove(principal);
          };
        };
      };
    };
  };

  // Admin-only function - delete staff user
  public shared ({ caller }) func deleteStaffUser(userId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete staff users");
    };
    switch (staffUserMap.get(userId)) {
      case (null) {
        Runtime.trap("User does not exist");
      };
      case (?user) {
        let deleted : StaffUser = { user with status = #deleted };
        staffUserMap.add(userId, deleted);

        // Remove any active sessions for this user
        for ((principal, staffUserId) in authenticatedStaff.entries()) {
          if (staffUserId.userId == userId) {
            authenticatedStaff.remove(principal);
          };
        };
      };
    };
  };

  // Admin-only function - view all active staff
  public query ({ caller }) func getAllActiveStaffUsers() : async [StaffUser] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view staff users");
    };

    staffUserMap.values().toArray().filter(func(user) { user.status == #activated });
  };

  // Admin-only function - view inactive staff
  public query ({ caller }) func getInactiveStaffUsers() : async [StaffUser] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view staff users");
    };

    staffUserMap.values().toArray().filter(func(user) { user.status == #deactivated });
  };

  // Admin-only function - view deleted staff
  public query ({ caller }) func getDeletedStaffUsers() : async [StaffUser] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view staff users");
    };

    staffUserMap.values().toArray().filter(func(user) { user.status == #deleted });
  };
};
