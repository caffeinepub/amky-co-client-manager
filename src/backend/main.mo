import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
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

  type Reply = {
    id : Text;
    clientId : ClientId;
    channel : Text;
    message : Text;
    createdAt : Time.Time;
  };

  module Client {
    public func compare(client1 : Client, client2 : Client) : Order.Order {
      switch (Text.compare(client1.name, client2.name)) {
        case (#equal) { Text.compare(client1.id, client2.id) };
        case (order) { order };
      };
    };
  };

  stable var clients = Map.empty<ClientId, Client>();
  stable var currentId = 0;

  stable var replies = Map.empty<Text, Reply>();
  stable var replyId = 0;

  func generateId() : ClientId {
    currentId += 1;
    "C" # currentId.toText();
  };

  func generateReplyId() : Text {
    replyId += 1;
    "R" # replyId.toText();
  };

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

  public shared ({ caller }) func addReply(clientId : ClientId, channel : Text, message : Text) : async () {
    if (not clients.containsKey(clientId)) {
      Runtime.trap("Client not found");
    };
    let id = generateReplyId();
    let reply : Reply = {
      id;
      clientId;
      channel;
      message;
      createdAt = Time.now();
    };
    replies.add(id, reply);
  };

  public query ({ caller }) func getReplies(clientId : ClientId) : async [Reply] {
    let filtered = replies.values().toArray().filter(func(r : Reply) : Bool {
      r.clientId == clientId
    });
    filtered.sort(func(a : Reply, b : Reply) : Order.Order {
      if (a.createdAt < b.createdAt) #less
      else if (a.createdAt > b.createdAt) #greater
      else #equal
    });
  };

  public shared ({ caller }) func deleteReply(id : Text) : async () {
    replies.remove(id);
  };
};
