import { Text, View, TextInput, Pressable, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext } from "react";

import { data } from "@/data/todos";
import { ThemeContext } from "@/context/ThemeContext";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Inter_300Light, useFonts } from "@expo-google-fonts/inter";
import { DancingScript_400Regular, DancingScript_500Medium } from "@expo-google-fonts/dancing-script";
// import { Octicons } from "@expo/vector-icons";

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

const defaultFont = "Inter_300Light"; // Default font
 
export default function Index() {
  // State for todos and input text
  const [todos, setTodos] = useState(data.sort((a, b) => b.id - a.id));
  const [text, setText] = useState("");
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);

  // Load fonts
  const [loaded, error] = useFonts({
    Inter_300Light,
    DancingScript_400Regular,
    DancingScript_500Medium,
  });

  // Create styles based on the current theme and color scheme
  const styles = createStyles(theme, colorScheme);

  // If 'loaded' is false, it means the fonts are still fetching.
  if (!loaded) {
    // We can return a loading component or simply null.
    // An ActivityIndicator is a good visual for the user.
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // You can also handle a real error here if the 'error' object is not null.
  if (error) {
    console.error("A real font loading error occurred:", error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load fonts.</Text>
      </View>
    );
  }

  // Function to add a new todo
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

  // Function to toggle the completion status of a todo
  const toggleTodo = (id) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  // Function to delete a todo
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Render each todo item
  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <Pressable onPress={() => toggleTodo(item.id)} style={{ flex: 1 }}>
        <Text style={item.completed ? styles.doneItem : styles.todoItem}>
          {item.title}
        </Text>
      </Pressable>
      <Pressable onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
        {/* <Text style={styles.deleteButtonText}>Delete</Text> */}
        <MaterialIcons name="highlight-remove" size={24} color="red" selectable={undefined} />
      </Pressable>
    </View>
  );

  // Main render function
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
        <Pressable onPress={() => setColorScheme(colorScheme === "light" ? "dark" : "light")} style={styles.colorSchemeButton}>
          <MaterialIcons name={colorScheme === "light" ? "light-mode" : "nightlight-round"} size={18} style={styles.colorSchemeIcon} />
        </Pressable>
      </View>

      {/* List of todos */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        // style={styles.todoList}
        renderItem={renderItem}
      />

      {/* Footer or additional content can go here */}

    </SafeAreaView>
  );
}

// Function to create styles based on the theme and color scheme
function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    errorText: {
      color: theme.text,
      fontFamily: defaultFont,
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.background,
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
      fontFamily: defaultFont,
    },
    addButton: {
      backgroundColor: "#007BFF",
      padding: 10,
      borderRadius: 5,
      marginLeft: 10,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 60,
      maxWidth: 80,
      flexDirection: "row",
      alignSelf: "center",
      pointerEvents: "auto",
      width: "100%",
    },
    addButtonText: {
      color: "#fff",
      textAlign: "center",
    },
    todoItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      fontFamily: defaultFont,
      color: theme.text,
    },
    doneItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      // fontFamily: "Inter_300Light",
      fontFamily: defaultFont,
      fontStyle: "italic",
      color: "#999",
      textDecorationLine: "line-through",
    },
    deleteButton: {
      marginLeft: 10,
    },
    deleteButtonText: {
      color: "red",
    },
    colorSchemeButton: {
      marginLeft: 10,
      padding: 10,
      // borderRadius: 5,
      // backgroundColor: "#007BFF",
    },
    colorSchemeIcon: {
      color: theme.icon,
      size: 18,
    },
  });
}
