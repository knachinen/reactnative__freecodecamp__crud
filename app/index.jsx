import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext, useEffect } from "react";

import { data } from "@/data/todos";
import { ThemeContext } from "@/context/ThemeContext";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Inter_300Light, useFonts } from "@expo-google-fonts/inter";
import {
  DancingScript_400Regular,
  DancingScript_500Medium,
} from "@expo-google-fonts/dancing-script";

import Animated, { LinearTransition } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const defaultFont = "Inter_300Light"; // Default font
const STORAGE_KEY = "todos"; // Key for AsyncStorage

export default function Index() {
  // State for todos and input text
  // const [todos, setTodos] = useState(data.sort((a, b) => b.id - a.id));
  const [todos, setTodos] = useState([]); // Initialize with an empty array
  const [text, setText] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const router = useRouter();

  // Load fonts
  const [loaded, error] = useFonts({
    Inter_300Light,
    DancingScript_400Regular,
    DancingScript_500Medium,
  });

  // Create styles based on the current theme and color scheme
  const styles = createStyles(theme, colorScheme);

  // Use useEffect to load todos from AsyncStorage when the component mounts
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);

        // Check if the string exists and is a valid JSON string
        if (storedTodos) {
          // Parse the JSON string into an array
          const parsedTodos = JSON.parse(storedTodos);

          // Check the length of the parsed array
          if (parsedTodos.length > 0) {
            // console.log("Parsed todos:", parsedTodos);
            const sortedTodos = parsedTodos.sort((a, b) => b.id - a.id);
            setTodos(sortedTodos);
          } else {
            // If the array is empty, use default data
            setTodos(data.sort((a, b) => b.id - a.id));
            console.log(
              "Found an empty array in AsyncStorage, using default data."
            );
          }
        } else {
          // If nothing is found in storage, use the default data
          setTodos(data.sort((a, b) => b.id - a.id));
          console.log("No todos found in AsyncStorage, using default data.");
        }
      } catch (error) {
        console.error("Failed to load todos from AsyncStorage:", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    loadTodos();
  }, []);

  // Use useEffect to save todos to AsyncStorage whenever the todos state changes
  useEffect(() => {
    const saveTodos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error("Failed to save todos to AsyncStorage:", error);
      }
    };
    if (!isDataLoading) {
      saveTodos();
    }
  }, [todos, isDataLoading]);

  // Function to export the todos to a file and share it.
  const exportToFile = async () => {
    if (!todos || todos.length === 0) {
      Alert.alert("No data to export", "Your to-do list is empty.");
      return;
    }

    try {
      // Get the data from AsyncStorage as a JSON string
      const jsonString = await AsyncStorage.getItem(STORAGE_KEY);

      // --- NEW: Platform-specific logic for exporting ---
      if (Platform.OS === "web") {
        // Handle export for web browsers
        const file = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "todos_backup.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Handle export for iOS and Android
        const fileUri = FileSystem.cacheDirectory + "todos_backup.json";
        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Export Todos",
            UTI: "public.json",
          });
        } else {
          Alert.alert(
            "Sharing not available",
            "Sharing is not available on this device."
          );
        }
      }
    } catch (error) {
      console.error("Error exporting todos:", error);
      Alert.alert("Export Failed", "There was an error exporting your to-dos.");
    }
  };

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
      setTodos([{ id: newId, title: text.trim(), completed: false }, ...todos]);
      setText("");
      // Log the new todo for debugging
      // console.log("New todo added:", { id: newId, text: text.trim(), completed: false });
      // console.log("Current todos:", todos);
    }
  };

  // Function to toggle the completion status of a todo
  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Function to delete a todo
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Function to handle pressing a todo item
  const handlePress = (id) => {
    // Navigate to the todo details or edit screen
    // For now, we will just log the id
    console.log("Todo pressed:", id);
    // You can implement navigation logic here if needed
    router.push(`/todos/${id}`);
  };

  // Render each todo item
  const renderItem = ({ item }) => (
    <Animated.View
      style={styles.todoItem}
      layout={LinearTransition.springify()}
    >
      <Pressable
        onPress={() => handlePress(item.id)}
        onLongPress={() => toggleTodo(item.id)}
        style={{ flex: 1 }}
      >
        <Text style={item.completed ? styles.doneItem : styles.todoItem}>
          {item.title}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => deleteTodo(item.id)}
        style={styles.deleteButton}
      >
        {/* <Text style={styles.deleteButtonText}>Delete</Text> */}
        <MaterialIcons
          name="highlight-remove"
          size={24}
          color="red"
          selectable={undefined}
        />
      </Pressable>
    </Animated.View>
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
        <Pressable
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          style={styles.colorSchemeButton}
        >
          <MaterialIcons
            name={colorScheme === "light" ? "light-mode" : "nightlight-round"}
            size={24}
            selectable={undefined}
            style={styles.colorSchemeIcon}
          />
        </Pressable>
        <Pressable onPress={exportToFile} style={styles.colorSchemeButton}>
          <MaterialIcons
            name="file-download"
            size={24}
            selectable={undefined}
            style={styles.colorSchemeIcon}
          />
        </Pressable>
      </View>

      {/* List of todos */}
      <Animated.FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        // style={styles.todoList}
        renderItem={renderItem}
        itemLayoutAnimation={LinearTransition}
        // transition={LinearTransition}
        keyboardDismissMode="on-drag"
      />

      {/* StatusBar for better visibility */}
      <StatusBar
        barStyle={colorScheme === "light" ? "dark-content" : "light-content"}
        backgroundColor={theme.background}
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
      borderRadius: 5,
      // borderColor: theme.icon,
      // borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: "#007BFF",
    },
    colorSchemeIcon: {
      color: theme.icon,
      size: 18,
    },
  });
}
