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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts, Inter_300Light } from "@expo-google-fonts/inter";
import {
  DancingScript_400Regular,
  DancingScript_500Medium,
} from "@expo-google-fonts/dancing-script";
import Animated, { LinearTransition } from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// Local imports
import { data } from "@/data/todos";
import { ThemeContext } from "@/context/ThemeContext";

// Constants
const defaultFont = "Inter_300Light";
const STORAGE_KEY = "todos";

/**
 * Main Todo List Screen Component.
 * Manages the state and functionality for the todo list, including
 * adding, deleting, and toggling todos, as well as handling
 * data persistence with AsyncStorage and theme switching.
 */
export default function Index() {
  // State variables for todos, input text, and loading status
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Access theme and router from contexts/hooks
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const router = useRouter();

  // Load fonts for the app.
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    DancingScript_400Regular,
    DancingScript_500Medium,
  });

  // Create styles based on the current theme and color scheme
  const styles = createStyles(theme, colorScheme);

  // --- useEffect Hook for Data Management ---
  // Load todos from AsyncStorage on component mount (runs only once).
  useEffect(() => {
    /**
     * Loads todos from AsyncStorage. If no data is found, it uses a default dataset.
     */
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          setTodos(parsedTodos.sort((a, b) => b.id - a.id));
        } else {
          // If no data is found, use the default data from a local file
          setTodos(data.sort((a, b) => b.id - a.id));
        }
      } catch (error) {
        console.error("Failed to load todos from AsyncStorage:", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    loadTodos();
  }, []); // Empty dependency array means this effect runs only once on mount.

  // Save todos to AsyncStorage whenever the `todos` state changes.
  useEffect(() => {
    const saveTodos = async () => {
      if (!isDataLoading) {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        } catch (error) {
          console.error("Failed to save todos to AsyncStorage:", error);
        }
      }
    };
    saveTodos();
  }, [todos, isDataLoading]); // This effect runs when todos or isDataLoading changes.

  /**
   * Handles the export functionality, saving todos to a file and sharing it.
   */
  const exportToFile = async () => {
    if (!todos || todos.length === 0) {
      Alert.alert("No data to export", "Your to-do list is empty.");
      return;
    }

    try {
      const jsonString = await AsyncStorage.getItem(STORAGE_KEY);
      if (Platform.OS === "web") {
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

  /**
   * Adds a new todo item to the list.
   */
  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? todos[0].id + 1 : 1;
      setTodos([{ id: newId, title: text.trim(), completed: false }, ...todos]);
      setText("");
    }
  };

  /**
   * Toggles the completion status of a todo item.
   * @param {number} id - The ID of the todo to toggle.
   */
  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  /**
   * Deletes a todo item from the list.
   * @param {number} id - The ID of the todo to delete.
   */
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  /**
   * Handles a press event on a todo item, navigating to the edit screen.
   * @param {number} id - The ID of the todo to edit.
   */
  const handlePress = (id) => {
    router.push(`/todos/${id}`);
  };

  /**
   * Renders each individual todo item in the FlatList.
   * @param {object} item - The todo item to render.
   */
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
        <MaterialIcons
          name="highlight-remove"
          size={24}
          color={theme.buttonWarning}
          selectable={undefined}
        />
      </Pressable>
    </Animated.View>
  );

  // Show a loading indicator while fonts or data are being loaded
  if (!fontsLoaded || isDataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  // Handle font loading error
  if (!fontsLoaded) {
    console.error("Font loading error.");
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load fonts.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Input section for adding new todos */}
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
        {/* Button to toggle color scheme */}
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
        {/* Button to export todos */}
        <Pressable onPress={exportToFile} style={styles.colorSchemeButton}>
          <MaterialIcons
            name="file-download"
            size={24}
            selectable={undefined}
            style={styles.colorSchemeIcon}
          />
        </Pressable>
      </View>

      {/* Main list of todos */}
      <Animated.FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        renderItem={renderItem}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
      />

      {/* Status bar to match the theme */}
      <StatusBar
        barStyle={colorScheme === "light" ? "dark-content" : "light-content"}
        backgroundColor={theme.background}
      />
    </SafeAreaView>
  );
}

/**
 * Creates and returns a StyleSheet object based on the provided theme and color scheme.
 * @param {object} theme - The theme object containing colors for the UI.
 * @param {string} colorScheme - The current color scheme ('light' or 'dark').
 * @returns {object} The StyleSheet object.
 */
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
      width: "100%",
      height: "100%",
    },
    inputContainer: {
      marginBottom: 20,
      flexDirection: "row",
      pointerEvents: "auto",
      width: "100%",
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.text,
      padding: 10,
      borderRadius: 5,
      flex: 1,
      fontFamily: defaultFont,
      color: theme.text,
      backgroundColor: theme.inputBackground,
    },
    addButton: {
      backgroundColor: theme.button,
      padding: 10,
      borderRadius: 5,
      marginLeft: 10,
      justifyContent: "center",
      alignItems: "center",
      width: 60,
    },
    addButtonText: {
      color: theme.buttonText,
      textAlign: "center",
      fontWeight: "bold",
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
      fontFamily: defaultFont,
      fontStyle: "italic",
      color: theme.textDone,
      textDecorationLine: "line-through",
    },
    deleteButton: {
      marginLeft: 10,
    },
    colorSchemeButton: {
      marginLeft: 10,
      padding: 10,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    colorSchemeIcon: {
      color: theme.icon,
      size: 24,
    },
  });
}
