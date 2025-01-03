import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Platform, Dimensions } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import CreateChatRoom from "../components/CreateChatRoom";
import { Ionicons } from '@expo/vector-icons';

// Define the type for individual vehicle item
interface VehicleItem {
  id: string;
  contactNo: string;
  images: string[];
  location: string;
  name: string;
  price: string;
  vehicleNo: string;
  vehicleType: string;
  sellerId: string;
  timeId: string;
}

const VehicleDetailsScreen: React.FC = () => {
  const [details, setDetails] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<{ [key: number]: number }>({});
  
  const windowWidth = Dimensions.get('window').width;
  const cardWidth = windowWidth - 32; // Subtract horizontal margins (16 * 2)

  const route = useRoute();
  const navigation = useNavigation<any>();
  const { subTopic } = route.params as { subTopic: string };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Hide the default header/navigation bar when component mounts
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // This hides the default navigation header
    });
    
    return () => {
      // Restore default header behavior when component unmounts (if needed)
      navigation.setOptions({
        headerShown: true,
      });
    };
  }, [navigation]);

  // Check user authentication status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  // Fetch vehicle details from Firestore
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const q = query(collection(db, "vehicleRentals"), where("vehicleType", "==", subTopic));
        const querySnapshot = await getDocs(q);
        const vehicleData: VehicleItem[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          sellerId: doc.data().uid,
          timeId: doc.data().timestamp,
        })) as VehicleItem[];

        setDetails(vehicleData);
        
        // Initialize active image index for each vehicle
        const initialActiveIndices: { [key: number]: number } = {};
        vehicleData.forEach((_, index) => {
          initialActiveIndices[index] = 0;
        });
        setActiveImageIndex(initialActiveIndices);
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [subTopic]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!details || details.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#24BAEC" />
          </TouchableOpacity>
          
          <Text style={styles.appBarTitle}>{subTopic}</Text>
        </View>
        <View style={styles.noDetailsContainer}>
          <Text style={styles.noDetailsText}>No vehicle rentals available for {subTopic}.</Text>
        </View>
      </View>
    );
  }

  const convertToUSD = (lkrPrice: number): string => {
    const exchangeRate: number = 320; // Example: 1 USD ≈ 320 LKR
    const usdPrice: number = lkrPrice / exchangeRate;
    return usdPrice.toFixed(2); // Show two decimal places
  };
  
  const handleScroll = (event: any, cardIndex: number) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / cardWidth);
    
    if (activeImageIndex[cardIndex] !== currentIndex) {
      setActiveImageIndex({
        ...activeImageIndex,
        [cardIndex]: currentIndex
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#24BAEC" />
        </TouchableOpacity>
        
        <Text style={styles.appBarTitle}>{subTopic}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView}>
        {details.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.imageContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.imageScroll}
                pagingEnabled
                onScroll={(e) => handleScroll(e, index)}
                scrollEventThrottle={16}
              >
                {item.images.length > 0 ? (
                  item.images.map((imageUri, imgIndex) => (
                    <Image
                      key={imgIndex}
                      source={{ uri: imageUri }}
                      style={[styles.image, { width: cardWidth }]}
                      resizeMode="cover"
                      onError={() => console.error("Image loading failed:", imageUri)}
                    />
                  ))
                ) : (
                  <View style={[styles.noImageContainer, { width: cardWidth }]}>
                    <Text style={styles.noImagesText}>No images available</Text>
                  </View>
                )}
              </ScrollView>
              
              {/* Image counter badge */}
              {item.images.length > 0 && (
                <View style={styles.imageCountBadge}>
                  <Text style={styles.imageCountText}>
                    {`${activeImageIndex[index] + 1}/${item.images.length}`}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.title}>{item.vehicleNo} </Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={20} color="#666" />
                  <Text style={styles.text}>
                    LKR {item.price} / ${convertToUSD(Number(item.price))}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.text}>{item.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.text}>{item.contactNo}</Text>
                </View>
              </View>

              {/* <TouchableOpacity
                style={styles.messageButton}
                onPress={async () => {
                  if (isAuthenticated) {
                    try {
                      const chatRoomId = await CreateChatRoom(item.sellerId, item.name, item.timeId);
                      navigation.navigate("ChatScreen", { chatRoomId, sellerName: item.name });
                    } catch (error) {
                      Alert.alert("Error", "Unable to create or navigate to the chat room.");
                    }
                  } else {
                    Alert.alert(
                      "Login Required",
                      "You must be logged in to use the messaging feature.",
                      [{ text: "OK" }]
                    );
                  }
                }}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#24BAEC" />
                <Text style={styles.messageButtonText}>Message Owner</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  appBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    marginTop: Platform.OS === 'ios' ? 50 : 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  imageScroll: {
    height: 200,
  },
  image: {
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noImageContainer: {
    height: 200,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesText: {
    color: '#666',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoContainer: {
    gap: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24BAEC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  noDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  noDetailsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default VehicleDetailsScreen;