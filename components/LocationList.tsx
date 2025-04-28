import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Details">;

interface LocationItem {
  id: string;
  name: string;
  type: string;
  image: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface LocationListProps {
  searchQuery: string;
}

const categories = [
  { id: "all", name: "All", icon: '🌎' },
  { id: "mountain", name: "Mountain", icon: '⛰️' },
  { id: "beach", name: "Beach", icon: '🏖️' },
  { id: "safari", name: "Safari", icon: '🐅' },
  { id: "surfing", name: "Surfing", icon: '🏄‍♂️' },
  { id: "hillStation", name: "Hill Station", icon: '🏞️' },
  { id: "historicalFort", name: "Historical Fort", icon: '🏰' },
  { id: "culturalcity", name: "Cultural City", icon: '🏙️' },
  { id: "island", name: "Island", icon: '🏝️' },
  { id: "historicalSite", name: "Historical Site", icon: '🏛️' },
  { id: "whaleWatching", name: "Whale Watching", icon: '🐋' },
  { id: "ancientRuins", name: "Ancient Ruins", icon: '🏺' },
  { id: "elephantorphanage", name: "Elephant Orphanage", icon: '🐘' },
  { id: "nationalPark", name: "National Park", icon: '🌳' },
];

const LocationList: React.FC<LocationListProps> = ({ searchQuery }) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "locations"));
        const fetchedLocations: LocationItem[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            type: data.type,
            image: data.image,
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
          };
        });
        setLocations(fetchedLocations);
        setFilteredLocations(fetchedLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    let filtered = locations;

    if (searchQuery.length > 0) {
      filtered = filtered.filter((location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((location) => {
        const normalizedLocationType = location.type.toLowerCase().replace(/\s/g, "");
        const normalizedSelectedType = selectedType.toLowerCase().replace(/\s/g, "");
        return normalizedLocationType === normalizedSelectedType;
      });
    }

    setFilteredLocations(filtered);
  }, [searchQuery, selectedType, locations]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderLocationItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      style={styles.destinationCard}
      onPress={() => navigation.navigate("Details", { location: item })}
    >
      <Image source={{ uri: item.image }} style={styles.destinationImage} />
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationName}>{item.name}</Text>
      </View>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={18} color="#888" />
        <Text style={styles.locationText}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedType === item.id && styles.selectedCategory,
            ]}
            onPress={() => setSelectedType(item.id)}
          >
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text 
              style={[
                styles.categoryText,
                selectedType === item.id && { color: '#FFFFFF' }
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Best Destination</Text>
      </View>

      <FlatList
        data={filteredLocations.slice(0, 3)}
        keyExtractor={(item) => item.id}
        renderItem={renderLocationItem}
        contentContainerStyle={styles.destinationsContainer}
        nestedScrollEnabled={true}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#333',
  },
  viewAllText: {
    fontSize: 16,
    color: '#FF7D45',
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  categoryItem: {
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 20,
    marginHorizontal: 6,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    minWidth: 120,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  selectedCategory: {
    backgroundColor: "#24BAEC",
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: '#333',
  },
  destinationsContainer: {
    paddingHorizontal: 5,
  },
  destinationCard: {
    backgroundColor: "#F3F2F2",
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOpacity: 0.2,  
    shadowRadius: 15,    
    shadowOffset: { width: 2, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F2F2',
  },
  destinationImage: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    backgroundColor: '#24BAEC',
  },
  destinationInfo: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationName: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#222',
  },
  locationContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 5,
    flex: 1,
  },
});

export default LocationList;