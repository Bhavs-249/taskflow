import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type TodoId = Text;

  type TodoPriority = {
    #low;
    #medium;
    #high;
  };

  module TodoPriority {
    public func compare(a : TodoPriority, b : TodoPriority) : Order.Order {
      switch (a, b) {
        case (#low, #low) { #equal };
        case (#low, _) { #less };
        case (#medium, #low) { #greater };
        case (#medium, #medium) { #equal };
        case (#medium, #high) { #less };
        case (#high, #high) { #equal };
        case (#high, _) { #greater };
      };
    };
  };

  type TodoStatus = {
    #pending;
    #inProgress;
    #done;
  };

  module TodoStatus {
    public func compare(a : TodoStatus, b : TodoStatus) : Order.Order {
      switch (a, b) {
        case (#pending, #pending) { #equal };
        case (#pending, _) { #less };
        case (#inProgress, #pending) { #greater };
        case (#inProgress, #inProgress) { #equal };
        case (#inProgress, #done) { #less };
        case (#done, #done) { #equal };
        case (#done, _) { #greater };
      };
    };
  };

  type Todo = {
    id : TodoId;
    title : Text;
    description : Text;
    priority : TodoPriority;
    status : TodoStatus;
    dueDate : ?Text;
    createdAt : Int;
  };

  module Todo {
    public func compare(todo1 : Todo, todo2 : Todo) : Order.Order {
      Text.compare(todo1.id, todo2.id);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let userTodos = Map.empty<Principal, Map.Map<TodoId, Todo>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func getUserTodoMap(user : Principal) : Map.Map<TodoId, Todo> {
    switch (userTodos.get(user)) {
      case (null) {
        let newMap = Map.empty<TodoId, Todo>();
        userTodos.add(user, newMap);
        newMap;
      };
      case (?todos) { todos };
    };
  };

  func getNextTodoId(todos : Map.Map<TodoId, Todo>) : TodoId {
    todos.size().toText();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  public shared ({ caller }) func createTodo(title : Text, description : Text, priority : TodoPriority, dueDate : ?Text) : async TodoId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create todos");
    };

    let todos = getUserTodoMap(caller);
    let newId = getNextTodoId(todos);

    let todo : Todo = {
      id = newId;
      title;
      description;
      priority;
      status = #pending;
      dueDate;
      createdAt = Time.now();
    };

    todos.add(newId, todo);
    newId;
  };

  public query ({ caller }) func getTodos() : async [Todo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get todos");
    };
    getUserTodoMap(caller).values().toArray().sort();
  };

  public query ({ caller }) func getTodo(id : TodoId) : async Todo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get todos");
    };
    let todos = getUserTodoMap(caller);
    switch (todos.get(id)) {
      case (null) { Runtime.trap("Todo not found") };
      case (?todo) { todo };
    };
  };

  public shared ({ caller }) func updateTodo(id : TodoId, title : Text, description : Text, priority : TodoPriority, status : TodoStatus, dueDate : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update todos");
    };

    let todos = getUserTodoMap(caller);

    switch (todos.get(id)) {
      case (null) { Runtime.trap("Todo not found") };
      case (?existingTodo) {
        let updatedTodo : Todo = {
          id;
          title;
          description;
          priority;
          status;
          dueDate;
          createdAt = existingTodo.createdAt;
        };

        todos.add(id, updatedTodo);
      };
    };
  };

  public shared ({ caller }) func deleteTodo(id : TodoId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete todos");
    };
    let todos = getUserTodoMap(caller);
    if (not todos.containsKey(id)) {
      Runtime.trap("Todo not found");
    };
    todos.remove(id);
  };

  public shared ({ caller }) func toggleStatus(id : TodoId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle todos");
    };
    let todos = getUserTodoMap(caller);

    switch (todos.get(id)) {
      case (null) { Runtime.trap("Todo not found") };
      case (?existingTodo) {
        let newStatus : TodoStatus = switch (existingTodo.status) {
          case (#pending) { #inProgress };
          case (#inProgress) { #done };
          case (#done) { #pending };
        };

        let updatedTodo : Todo = {
          id = existingTodo.id;
          title = existingTodo.title;
          description = existingTodo.description;
          priority = existingTodo.priority;
          status = newStatus;
          dueDate = existingTodo.dueDate;
          createdAt = existingTodo.createdAt;
        };

        todos.add(id, updatedTodo);
      };
    };
  };

  public query ({ caller }) func getTodoStats() : async {
    total : Nat;
    pending : Nat;
    inProgress : Nat;
    done : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get todo stats");
    };
    let todos = getUserTodoMap(caller);
    let stats = todos.values().foldLeft({ total = 0; pending = 0; inProgress = 0; done = 0 }, func(acc, todo) {
      switch (todo.status) {
        case (#pending) { { total = acc.total + 1; pending = acc.pending + 1; inProgress = acc.inProgress; done = acc.done } };
        case (#inProgress) { { total = acc.total + 1; pending = acc.pending; inProgress = acc.inProgress + 1; done = acc.done } };
        case (#done) { { total = acc.total + 1; pending = acc.pending; inProgress = acc.inProgress; done = acc.done + 1 } };
      };
    });
    stats;
  };
};
