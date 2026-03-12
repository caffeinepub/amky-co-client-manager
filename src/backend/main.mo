import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  // 1. Custom Types
  type ClientId = Text;

  type Client = {
    id : ClientId;
    name : Text;
    email : Text;
    phone : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  type ClientInput = {
    name : Text;
    email : Text;
    phone : Text;
    notes : Text;
  };

  // 2. Client Compare
  module Client {
    public func compare(client1 : Client, client2 : Client) : Order.Order {
      switch (Text.compare(client1.name, client2.name)) {
        case (#equal) { Text.compare(client1.id, client2.id) };
        case (order) { order };
      };
    };
  };

  // 3. Persistent Data Structure
  let clients = Map.empty<ClientId, Client>();

  var currentId = 0;

  // 4. Create Unique Client ID
  func generateId() : ClientId {
    currentId += 1;
    "C" # currentId.toText();
  };

  // 5. Public Functions
  public shared ({ caller }) func addClient(input : ClientInput) : async () {
    let id = generateId();
    let client : Client = {
      id;
      name = input.name;
      email = input.email;
      phone = input.phone;
      notes = input.notes;
      createdAt = Time.now();
    };
    clients.add(id, client);
  };

  public shared ({ caller }) func editClient(id : ClientId, input : ClientInput) : async () {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?existingClient) {
        let updatedClient : Client = {
          id = existingClient.id;
          name = input.name;
          email = input.email;
          phone = input.phone;
          notes = input.notes;
          createdAt = existingClient.createdAt;
        };
        clients.add(id, updatedClient);
      };
    };
  };

  public shared ({ caller }) func deleteClient(id : ClientId) : async () {
    if (not clients.containsKey(id)) {
      Runtime.trap("Client not found");
    };
    clients.remove(id);
  };

  public query ({ caller }) func getClient(id : ClientId) : async Client {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) { client };
    };
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    clients.values().toArray().sort();
  };
};
