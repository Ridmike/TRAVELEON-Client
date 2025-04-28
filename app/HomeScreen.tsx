import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, TouchableWithoutFeedback, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { RootStackParamList } from "../App";
import SidePanel from "../components/SidePanel";
import LocationList from "../components/LocationList";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isSidePanelVisible, setSidePanelVisible] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const toggleDropdown = () => setDropdownVisible(!isDropdownVisible);
  const toggleSidePanel = () => setSidePanelVisible(!isSidePanelVisible);
  const closeDropdown = () => setDropdownVisible(false);
  const closeSidePanel = () => setSidePanelVisible(false);


  useFocusEffect(
    useCallback(() => {
      setDropdownVisible(false);
      setSidePanelVisible(false);
    }, [])
  );
  
  // Fetch User Data if Authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "usersForign", user.uid));
          setUserName(userDoc.exists() ? userDoc.data().name || "User" : "User");
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("User");
        }
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserName(null);
      setDropdownVisible(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <TouchableWithoutFeedback onPress={() => { closeDropdown(); closeSidePanel(); }}>
      <View style={styles.MainOuter}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <View style={styles.appBarContent}>
            <TouchableOpacity onPress={toggleSidePanel} style={styles.menuButton}>
              <Ionicons name="menu-outline" size={28} color="#333" />
            </TouchableOpacity>
            
         
            
            <View style={styles.appBarRight}>
             
              
              <TouchableOpacity onPress={toggleDropdown} style={styles.profileButton}>
                <Ionicons name="person-circle" size={36} color="#FEE1E8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.BodySecOuter}>
            
            <View style={styles.heroContainer}>
              <Text style={styles.exploreText}>Explore the</Text>
              <View style={styles.beautifulWorldContainer}>
                <Text style={styles.beautifulText}>Beautiful </Text>
                <Text style={styles.worldText}>SriLanka</Text>
                <Text style={styles.exclamationText}>!</Text>
              </View>
              <View style={styles.underline} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={[styles.SearchOuter, isSearchFocused && styles.SearchOuterFocused]}>
                <Ionicons 
                  name="search" 
                  size={24} 
                  color={isSearchFocused ? "#24BAEC" : "#888"} 
                />
                <TextInput
                  style={[styles.SearchText, isSearchFocused && styles.SearchTextFocused]}
                  placeholder="Where do you want to go?"
                  placeholderTextColor={isSearchFocused ? "#24BAEC" : "#888"}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </View>
            </View>

            <View style={styles.cardGrid}>
              <LocationList searchQuery={searchQuery} />
            </View>
          </View>
        </ScrollView>

        {/* Side Panel */}
        <SidePanel isVisible={isSidePanelVisible} onClose={closeSidePanel} />

        {/* Dropdown Menu */}
        {isDropdownVisible && (
          <View style={styles.dropdownMenu}>
            {userName ? (
              <>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate("Profile")}>
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate("ChatRoomList")}>
                  <Text style={styles.dropdownText}>Chat List</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.dropdownText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.dropdownText}>Sign Up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  MainOuter: {
    flex: 1,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  appBar: {
    height: 60,
    backgroundColor: '#FFFFFF',
    marginHorizontal: -20, 
    paddingHorizontal: 20,
    marginTop: 20, 
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  menuButton: {
    padding: 8,
  },
  appBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  profileButton: {
    padding: 8,
  },
  notificationIcon: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#FF7D45',
    borderRadius: 4,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  BodySecOuter: {
    paddingTop: 20,
  },
  heroContainer: {
    marginBottom: 40,
  },
  exploreText: {
    fontSize: 28,
    fontWeight: "500",
    color: "#333",
  },
  beautifulWorldContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  beautifulText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#222",
  },
  worldText: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FF7D45",
  },
  exclamationText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FF7D45",
  },
  underline: {
    position: "absolute",
    bottom: -5,
    right: 70,
    width: 100,
    height: 3,
    backgroundColor: "#FF7D45",
    borderRadius: 2,
  },
  searchBarContainer: {
    // marginBottom: 25,
  },
  SearchOuter: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 25, // Make it more pill-shaped
    padding: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  SearchOuterFocused: {
    borderColor: "#24BAEC",
    backgroundColor: "#FFFFFF",
  },
  SearchText: {
    paddingLeft: 10,
    fontSize: 16,
    flex: 1,
    color: "#333",
  },
  SearchTextFocused: {
    color: "#24BAEC",
  },
  cardGrid: {
    // marginTop: 10,
    // marginBottom: 10,
  },
  NavBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  MenuIcon: {
    marginRight: 10,
    marginLeft: 10,
  },
  ProfileIcon: {
    marginRight: 10,
    alignItems: "flex-end",
  },
  dropdownMenu: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: 130,
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  dropdownText: {
    fontSize: 16,
  },
});