import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type OldAppointmentStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  type OldAppointmentRequest = {
    parentName : Text;
    childName : Text;
    childAge : Nat;
    phoneNumber : Text;
    email : ?Text;
    preferredDate : Int;
    preferredTime : Text;
    reason : Text;
    submissionTime : Int;
    status : OldAppointmentStatus;
  };

  type OldStaffCredentials = {
    userId : Text;
    password : Text;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldActivationStatus = {
    #activated;
    #deactivated;
    #deleted;
  };

  type OldStaffUser = {
    userId : Text;
    password : Text;
    email : ?Text;
    status : OldActivationStatus;
  };

  type OldActor = {
    appointments : List.List<OldAppointmentRequest>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    staffUserMap : Map.Map<Text, OldStaffUser>;
    authenticatedStaff : Map.Map<Principal, Text>;
  };

  // New types
  type NewAppointmentStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
    #review;
    #postponed;
    #preponed;
  };

  type NewAppointmentRequest = {
    parentName : Text;
    childName : Text;
    childAge : Nat;
    phoneNumber : Text;
    email : ?Text;
    preferredDate : Int;
    preferredTime : Text;
    reason : Text;
    submissionTime : Int;
    status : NewAppointmentStatus;
  };

  type NewStaffCredentials = {
    userId : Text;
    password : Text;
  };

  type NewUserProfile = {
    name : Text;
  };

  type NewActivationStatus = {
    #activated;
    #deactivated;
    #deleted;
  };

  type NewStaffUser = {
    userId : Text;
    password : Text;
    email : ?Text;
    status : NewActivationStatus;
  };

  type NewStaffSession = {
    principal : Principal;
    userId : Text;
    timestamp : Int;
  };

  type NewActor = {
    appointments : List.List<NewAppointmentRequest>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    staffUserMap : Map.Map<Text, NewStaffUser>;
    authenticatedStaff : Map.Map<Principal, NewStaffSession>;
  };

  public func run(old : OldActor) : NewActor {
    let newAppointments = old.appointments.map<OldAppointmentRequest, NewAppointmentRequest>(
      func(oldAppointment) {
        {
          oldAppointment with
          status = migrateAppointmentStatus(oldAppointment.status);
        };
      }
    );

    let newAuthenticatedStaff = Map.empty<Principal, NewStaffSession>();
    old.authenticatedStaff.keys().forEach(
      func(principal) {
        switch (old.authenticatedStaff.get(principal)) {
          case (null) {};
          case (?userId) {
            let session : NewStaffSession = {
              principal;
              userId;
              timestamp = 0;
            };
            newAuthenticatedStaff.add(principal, session);
          };
        };
      }
    );

    {
      old with
      appointments = newAppointments;
      authenticatedStaff = newAuthenticatedStaff;
    };
  };

  func migrateAppointmentStatus(oldStatus : OldAppointmentStatus) : NewAppointmentStatus {
    switch (oldStatus) {
      case (#pending) { #pending };
      case (#confirmed) { #confirmed };
      case (#completed) { #completed };
      case (#cancelled) { #cancelled };
    };
  };
};
