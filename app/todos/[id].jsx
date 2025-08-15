import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Inter_300Light, useFonts } from "@expo-google-fonts/inter";
import { ThemeContext } from "@/context/ThemeContext";

const STORAGE_KEY = "todos"; // Key for AsyncStorage

// Edit Todo Screen
export default function EditScreen() {
  const { id } = useLocalSearchParams();
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  console.log("EditScreen | colorScheme:", colorScheme);
  console.log("EditScreen | theme:", theme);

  const [todo, setTodo] = useState({});
  // const [isDataLoading, setIsDataLoading] = useState(true);

  const router = useRouter();

  // Use useEffect to load todos from AsyncStorage when the component mounts
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);

        // Check if the string exists and is a valid JSON string
        if (storedTodos) {
          // Parse the JSON string into an array
          const parsedTodos = JSON.parse(storedTodos); // parsedTodos is the total todos array

          // Check the length of the parsed array
          if (parsedTodos.length > 0) {
            // console.log("loadTodos() | Parsed todos:", parsedTodos);
            // Find the todo with the matching id
            // Note: id is a string, so we need to convert it to an integer for comparison
            // Also, ensure that the id is a valid number before parsing
            if (isNaN(id)) {
              console.warn(`loadTodos() | Invalid id: ${id}`);
            } else {
              // Find the todo with the matching id
              // Use parseInt to convert the id to a number for comparison
              // console.log("loadTodos() | Looking for todo with id:", id);
              const myTodo = parsedTodos.find(
                (todo) => todo.id === parseInt(id)
              );
              if (myTodo) {
                setTodo(myTodo);
                // console.log("loadTodos() | Found todo:", myTodo);
              } else {
                console.warn(`loadTodos() | Todo with id ${id} not found.`);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load todos from AsyncStorage:", error);
      } finally {
        // setIsDataLoading(false);
      }
    };
    loadTodos(id);
  }, [id]);

  // Load fonts
  const [loaded, error] = useFonts({
    Inter_300Light,
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

  const handleSave = async () => {
    // Logic to save the edited todo
    // For now, we will just log the current state
    // console.log("handleSave | Saving todo:", todo);

    // You can implement saving logic here, e.g., updating AsyncStorage
    try {
      // AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      const updatedTodos = { ...todo, title: todo.title };
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedTodos = jsonValue ? JSON.parse(jsonValue) : [];
      // console.log("handleSave | Parsed todos:", parsedTodos);

      if (parsedTodos && parsedTodos.length > 0) {
        // Update the existing todo with the same id
        // console.log("handleSave | Updating existing todo with id:", updatedTodos.id);
        // Find the todo with the same id and update it
        // const updatedTodos = parsedTodos.map(t => t.id === updatedTodos.id ? updatedTodos : t);
        // Save the updated todos back to AsyncStorage
        const otherTodos = parsedTodos.filter((t) => t.id !== updatedTodos.id);
        const newTodos = [...otherTodos, updatedTodos];
        // console.log("handleSave | New todos array:", newTodos);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
      } else {
        // If no todos exist, create a new array with the updated todo
        console.log(
          "handleSave | No existing todos found, creating a new todo."
        );
        // await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([updatedTodos]));
      }
      console.log("handleSave | Todo saved successfully.");

      router.push("/"); // Navigate back to the main screen after saving
      Alert.alert(
        "handleSave | Todo saved",
        `Todo with id ${id} has been saved.`
      );
    } catch (error) {
      console.error("handleSave | Failed to save todo:", error);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: styles.background.backgroundColor }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Edit Todo : {id}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter todo title"
          placeholderTextColor="#999"
          value={todo.title || ""}
          onChangeText={(text) => setTodo((prev) => ({ ...prev, title: text }))}
          maxLength={50}
        />

        {/* Button container */}
        <View style={styles.buttonContainer}>
          {/* Save button to save the edited todo */}
          <Pressable
            style={styles.button}
            onPress={handleSave}
            disabled={!todo.title}
          >
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>

          {/* Cancel button to go back to the main screen */}
          <Pressable
            style={[styles.button, { backgroundColor: "red" }]}
            onPress={() => router.push("/")}
            disabled={!todo.title}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </SafeAreaView>
  );
}

function createStyles(theme, colorScheme) {
  console.log("createStyles() | theme:", theme);
  return StyleSheet.create({
    background: {
      // backgroundColor: Colors[theme].background,
      // backgroundColor: colorScheme === "dark" ? Colors.dark.background : Colors.light.background,
      backgroundColor: theme.background,
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      flex: 1,
      padding: 20,
      // backgroundColor: "#f1f1f1",
    },
    buttonContainer: {
      flexDirection: "row",
      // justifyContent: "space-between",
      justifyContent: "space-evenly",
      // marginTop: 20,
      paddingHorizontal: 10,
      // borderRadius: 5,
      paddingVertical: 10,
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme.text,
    },
    input: {
      height: 40,
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 20,
      color: theme.text,
    },
    button: {
      backgroundColor: "#007BFF",
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
      width: "30%",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    buttonDisabled: {
      backgroundColor: "#ccc",
    },
    buttonTextDisabled: {
      color: "#666",
    },
    errorText: {
      color: "red",
      marginTop: 10,
    },
    successText: {
      color: "green",
      marginTop: 10,
    },
    loadingIndicator: {
      marginTop: 20,
    },
  });
}
