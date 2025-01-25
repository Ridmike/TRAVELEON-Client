import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';  

const DetailsLocation: React.FC<{ route: any }> = ({ route }) => {
  const { location } = route.params;
  const navigation = useNavigation();

  // Function to handle opening maps with directions
  const handleDirections = () => {
    try {
      // Check if location has coordinates
      if (!location.latitude || !location.longitude) {
        // If coordinates aren't available in the location object, we need to fetch them
        fetchLocationCoordinates(location.id)
          .then(coordinates => {
            openMapsWithDirections(coordinates.latitude, coordinates.longitude, location.name);
          })
          .catch(error => {
            Alert.alert("Error", "Could not fetch location coordinates. Please try again later.");
            console.error("Error fetching coordinates:", error);
          });
      } else {
        // If coordinates are already available in the location object
        openMapsWithDirections(location.latitude, location.longitude, location.name);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open map directions. Please try again.");
      console.error("Error opening maps:", error);
    }
  };

  // Function to fetch coordinates from backend
  const fetchLocationCoordinates = async (locationId: string | number): Promise<{ latitude: number; longitude: number }> => {
    // Replace this with your actual API call to fetch coordinates
    try {
      // Example API call:
      // const response = await fetch(`https://your-api.com/locations/${locationId}/coordinates`);
      // const data = await response.json();
      // return { latitude: data.latitude, longitude: data.longitude };
      
      // For demonstration, return mock data
      console.log(`Fetching coordinates for location ID: ${locationId}`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ latitude: 37.7749, longitude: -122.4194 });
        }, 500);
      });
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      throw error;
    }
  };

  // Function to open map with directions
  const openMapsWithDirections = (latitude: number, longitude: number, destinationName: string) => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(destinationName);
    
    // Different URL formats for iOS and Android
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}&dirflg=d`,
      android: `${scheme}0,0?q=${latLng}(${label})&dirflg=d`
    });

    // Open the maps app
    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert("Error", "Could not open maps application.");
        console.error("Error opening maps:", err);
      });
    }
  };

  // Alternative to open in Google Maps specifically
  const openGoogleMapsDirections = (latitude: number, longitude: number, destinationName: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(destinationName)}`;
    Linking.openURL(url).catch(err => {
      Alert.alert("Error", "Could not open Google Maps.");
      console.error("Error opening Google Maps:", err);
    });
  };

  return (
    <View style={[styles.container]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      <ScrollView>
        <Image 
          source={{ uri: location.image }}
          style={styles.mainImage} 
          resizeMode="cover"
        />

        {/* White card overlay */}
        <View style={styles.cardOverlay}>
          {/* Location name and area */}
          <Text style={styles.title}>{location.name}</Text>
          <Text style={styles.subtitle}>{location.type}</Text>
          
          {/* About section */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About Destination</Text>
            <Text style={styles.description}>{location.description}</Text>
          </View>

          {/* Direction button with updated onPress handler */}
          <TouchableOpacity style={styles.bookButton} onPress={handleDirections}>
            <Text style={styles.bookButtonText}>Direction</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "500",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  bookmarkButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  mainImage: {
    width: "100%",
    height: 300,
  },
  cardOverlay: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#888",
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#888",
  },
  aboutSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  bookButton: {
    backgroundColor: "#61CDFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});