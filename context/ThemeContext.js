import { createContext, useState } from "react";
import { Appearance } from "react-native";

import { Colors } from "@/constants/Colors";

export const ThemeContext = createContext({});
export const ThemeProvider = ({ children }) => {
  // console.log("ThemeProvider | Initializing", Appearance.getColorScheme());
  const [colorScheme, setColorScheme] = useState(
    // Get the initial color scheme from the system
    Appearance.getColorScheme() || "light" // Default to light mode
  );

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  console.log("ThemeProvider | colorScheme:", colorScheme);
  console.log("ThemeProvider | theme:", theme);

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
