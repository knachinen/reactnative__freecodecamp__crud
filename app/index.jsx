import { Text, View, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { data } from "@/data/todos";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// const renderItem = ({ item }) => (
//   <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
//     <Pressable onPress={() => toggleTodo(item.id)} style={{ flex: 1 }}>
//       <Text style={{ textDecorationLine: item.completed ? "line-through" : "none" }}>
//         {item.title}
//       </Text>
//     </Pressable>
//     <Pressable onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
//       <MaterialIcons name="delete" size={24} color="black" />
//     </Pressable>
//   </View>
// );
 
export default function Index() {
  const [todos, setTodos] = useState(data.sort((a, b) => b.id - a.id));
  const [text, setText] = useState("");

  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? todos[0].id + 1 : 1;
      setTodos([
        { id: newId, text: text.trim(), completed: false },
        ...todos,
      ]);
      setText("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <Pressable onPress={() => toggleTodo(item.id)} style={{ flex: 1 }}>
        <Text style={{ textDecorationLine: item.completed ? "line-through" : "none" }}>
          {item.title}
        </Text>
      </Pressable>
      <Pressable onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
        {/* <Text style={styles.deleteButtonText}>Delete</Text> */}
        <MaterialIcons name="highlight-remove" size={24} color="red" selectable={undefined} />
      </Pressable>
    </View>
  );

  // if (!todos.length) {
  //   return (
  //     <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <Text>No todos available. Add a new todo!</Text>
  //     </SafeAreaView>
  //   );
  // }

  // const newTodo = {
  //   id: todos.length + 1,
  //   text: text.trim(),
  //   completed: false,
  // };
  // setTodos([newTodo, ...todos]);
  // setText("");

  return (
    <SafeAreaView style={styles.container}>

      {/* Input for adding new todo */}
      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a new todo"
          placeholderTextColor={"#999"}
          style={styles.textInput}
        />
        <Pressable onPress={addTodo} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        renderItem={renderItem}
      />

      {/* {todos.map((todo) => (

        <View key={todo.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>

          <Pressable onPress={() => toggleTodo(todo.id)} style={{ flex: 1 }}>
            <Text style={{ textDecorationLine: todo.completed ? "line-through" : "none" }}>
              {todo.text}
            </Text>
          </Pressable>

          <Pressable onPress={() => deleteTodo(todo.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>

        </View>

      ))} */}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
    flexDirection: "row",
    pointerEvents: "auto",
    marginHorizontal: "auto",
    width: "100%",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  addButton: {
    // marginTop: 10,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
    maxWidth: 80,
    // minHeight: 40,
    // maxHeight: 50,
    flexDirection: "row",
    alignSelf: "center",
    pointerEvents: "auto",
    width: "100%",
    // height: "100%",
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "red",
  },
});
