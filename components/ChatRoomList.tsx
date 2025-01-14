import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image, SafeAreaView, StatusBar, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ChatScreen">;

// Define TypeScript interfaces for data structures
interface ChatRoom {
  id: string;
  addPostName: string;
  sellerId: string;
  sellerName?: string;
  lastMessage?: string;
  timestamp?: number;
  read?: boolean;
  avatar?: string | null;  
  status?: string;  
}

interface Seller {
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'typing';
}

const ChatRoomListScreen: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chatRooms"),
      where("buyerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const loadedChatRooms = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const sellerId = data.sellerId;
          let sellerName = "Unknown Seller";
          let avatar = null;
          let status = 'offline';
          let lastMessage = data.lastMessage || "";
          let timestamp = data.timestamp || Date.now();
          let read = data.read !== undefined ? data.read : true;

          // Fetch seller name from usersLocal collection
          if (sellerId) {
            const sellerDoc = await getDoc(doc(db, "usersLocal", sellerId));
            if (sellerDoc.exists()) {
              const sellerData = sellerDoc.data() as Seller;
              sellerName = sellerData.name;
              avatar = sellerData.avatar;
              status = sellerData.status || 'offline';
            }
          }

          return {
            id: docSnap.id,
            addPostName: data.addPostName,
            sellerId,
            sellerName,
            avatar,
            status,
            lastMessage,
            timestamp,
            read
          };
        })
      );

      // Sort by timestamp (newest first)
      loadedChatRooms.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setChatRooms(loadedChatRooms);
    });

    return unsubscribe;
  }, [currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,  // This will hide the default header
    });
  }, [navigation]);

  const navigateToChat = (chatRoomId: string, sellerName: string) => {
    navigation.navigate("ChatScreen", {
      chatRoomId,
      sellerName,
    });
  };

  const getStatusColor = (status: string | undefined) => {
    switch(status) {
      case 'online': return '#4CAF50';
      case 'typing': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const formatTime = (timestamp: number | undefined) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Active Chats</Text>
        </View>
        
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Remove the existing titleRow and keep the rest of the content */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for chats & messages"
          placeholderTextColor="#8E8E93"
        />
      </View>
      
      {!currentUser ? (
        <Text style={styles.notLoggedInText}>Please log in to see your chat rooms.</Text>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatRoomItem}
              onPress={() => navigateToChat(item.id, item.sellerName || "Unknown Seller")}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarPlaceholder}>
                      {(item.sellerName?.[0] || "?").toUpperCase()}
                    </Text>
                  )}
                </View>
                <View 
                  style={[
                    styles.statusIndicator, 
                    { backgroundColor: getStatusColor(item.status) }
                  ]} 
                />
              </View>
              
              <View style={styles.contentContainer}>
                <View style={styles.topRow}>
                  <Text style={styles.sellerName} numberOfLines={1}>
                    {item.sellerName}
                  </Text>
                  <View style={styles.timestampContainer}>
                    {item.status === 'typing' ? (
                      <Text style={[styles.timestamp, { color: '#2196F3' }]}>
                        Typing...
                      </Text>
                    ) : (
                      <Text style={styles.timestamp}>
                        {formatTime(item.timestamp)}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.bottomRow}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.status === 'typing' ? 'Typing...' : 
                      item.lastMessage || `Hi! Let's talk about ${item.addPostName}`}
                  </Text>
                  {!item.read && <View style={styles.unreadIndicator} />}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatRoomListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    backgroundColor: '#FFFFFF',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4CAF50",
  },
  callButton: {
    padding: 5,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 15, // Add this line for top padding
  },
  searchInput: {
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    fontSize: 16,
  },
  notLoggedInText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#888",
  },
  chatRoomItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD1DC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestampContainer: {
    marginLeft: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  unreadIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginLeft: 5,
  },
});