import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Inter_300Light, useFonts } from "@expo-google-fonts/inter";
import { ThemeContext } from "@/context/ThemeContext";

const STORAGE_KEY = "todos"; // Key for AsyncStorage

/**
 * Edit Todo Screen Component
 * Allows users to edit the title of a specific todo item.
 */
export default function EditScreen() {
  // Get the 'id' from the URL parameters using the useLocalSearchParams hook
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Use the ThemeContext to access the current theme and color scheme
  const { colorScheme, theme } = useContext(ThemeContext);

  // State to hold the current todo item being edited
  const [todo, setTodo] = useState(null);
  const [isTodoLoading, setIsTodoLoading] = useState(true);

  // Load fonts for the app.
  const [fontsLoaded] = useFonts({
    Inter_300Light,
  });

  // Load the specific todo item from AsyncStorage when the component mounts
  useEffect(() => {
    const loadTodo = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          const foundTodo = parsedTodos.find(
            (item) => item.id === parseInt(id)
          );
          if (foundTodo) {
            setTodo(foundTodo);
          } else {
            console.warn(`Todo with id ${id} not found.`);
          }
        }
      } catch (error) {
        console.error("Failed to load todo from AsyncStorage:", error);
      } finally {
        setIsTodoLoading(false);
      }
    };

    loadTodo();
  }, [id]);

  /**
   * Handles saving the edited todo item back to AsyncStorage.
   * This function fetches all todos, updates the specific todo,
   * and then saves the entire array back to storage.
   */
  const handleSave = async () => {
    // Check if the todo title is valid before saving
    if (!todo || !todo.title || todo.title.trim() === "") {
      return;
    }

    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedTodos = jsonValue ? JSON.parse(jsonValue) : [];

      // Map over the existing todos and update the one that matches the id
      const updatedTodos = parsedTodos.map((item) =>
        item.id === todo.id ? { ...item, title: todo.title.trim() } : item
      );

      // Save the updated array back to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      console.log("Todo saved successfully.");

      // Navigate back to the home screen
      router.push("/");
    } catch (error) {
      console.error("Failed to save todo:", error);
    }
  };

  // Create styles based on the current theme
  const styles = createStyles(theme);

  // Display a loading indicator while fonts or data are being loaded
  if (!fontsLoaded || isTodoLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  // If the todo is not found after loading, display an error message
  if (!todo) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Todo not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Todo: {id}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter todo title"
          placeholderTextColor="#999"
          value={todo.title}
          onChangeText={(text) => setTodo((prev) => ({ ...prev, title: text }))}
          maxLength={50}
        />

        {/* Button container */}
        <View style={styles.buttonContainer}>
          {/* Save button to save the edited todo */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor:
                  todo.title.trim() === "" ? "#ccc" : theme.button,
              },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleSave}
            disabled={todo.title.trim() === ""}
          >
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>

          {/* Cancel button to go back to the main screen */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.buttonWarning },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push("/")}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </SafeAreaView>
  );
}

/**
 * Creates and returns a StyleSheet object based on the provided theme.
 * @param {object} theme - The theme object containing colors for the UI.
 * @returns {object} The StyleSheet object.
 */
const createStyles = (theme) => {
  return StyleSheet.create({
    background: {
      backgroundColor: theme.background,
      flex: 1,
      padding: 20,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      flex: 1,
      padding: 20,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
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
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
      width: "40%", // Adjusted width for better spacing
      color: theme.button,
    },
    buttonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: "bold",
    },
    errorText: {
      color: "red",
      fontSize: 16,
    },
  });
};
