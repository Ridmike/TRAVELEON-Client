import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, SafeAreaView, StatusBar
} from "react-native";
import {
  collection, query, where, onSnapshot, getDoc, doc, getDocs
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ChatScreen">;

interface ChatRoom {
  id: string;
  sellerName: string;
  sellerId: string;
  lastMessage?: string;
  timestamp?: number;
  read?: boolean;
  avatar?: string | null;
  status?: string;
}

const ChatScreen: React.FC = () => {
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
          let lastMessage = "Start chatting";
          let timestamp = 0;
          let read = data.read !== undefined ? data.read : true;

          // Fetch seller info
          if (sellerId) {
            const sellerDoc = await getDoc(doc(db, "usersLocal", sellerId));
            if (sellerDoc.exists()) {
              const sellerData = sellerDoc.data();
              sellerName = sellerData.name;
              avatar = sellerData.avatar;
              status = sellerData.status || 'offline';
            }
          }

          // Fetch latest message
          try {
            const messagesRef = collection(db, "chatRooms", docSnap.id, "messages");
            const messagesSnapshot = await getDocs(messagesRef);
            messagesSnapshot.forEach((msgDoc) => {
              const msgData = msgDoc.data();
              const msgTime = msgData.createdAt ? new Date(msgData.createdAt).getTime() : 0;
              if (msgTime > timestamp) {
                lastMessage = msgData.text || "Start chatting";
                timestamp = msgTime;
              }
            });
          } catch (e) {
            console.error("Error fetching messages for chatRoom:", docSnap.id, e);
          }

          return {
            id: docSnap.id,
            sellerName,
            sellerId,
            avatar,
            status,
            lastMessage,
            timestamp,
            read
          };
        })
      );

      loadedChatRooms.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setChatRooms(loadedChatRooms);
    });

    return unsubscribe;
  }, [currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'typing': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const formatTime = (timestamp: number | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString();
  };

  const renderChatRoomItem = (item: ChatRoom) => (
    <TouchableOpacity
      key={item.id}
      style={styles.chatRoomItem}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          chatRoomId: item.id,
          sellerName: item.sellerName,
        })
      }
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
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.buyerName} numberOfLines={1}>
            {item.sellerName}
          </Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.status === 'typing' ? 'Typing...' : item.lastMessage}
          </Text>
          {!item.read && <View style={styles.unreadIndicator} />}
        </View>
      </View>
    </TouchableOpacity>
  );

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
        
      </View>
      {!currentUser ? (
        <Text style={styles.notLoggedInText}>
          Please log in to see your chat rooms.
        </Text>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderChatRoomItem(item)}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  notLoggedInText: {
    textAlign: "center", marginTop: 20, fontSize: 16, color: "#888"
  },
  chatRoomItem: {
    flexDirection: 'row', padding: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#E8E8E8',
  },
  avatarContainer: {
    position: 'relative', marginRight: 15,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%', height: '100%',
  },
  avatarPlaceholder: {
    fontSize: 20, fontWeight: 'bold', color: '#8E24AA',
  },
  statusIndicator: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: '#FFF',
  },
  contentContainer: {
    flex: 1, justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 16, fontWeight: '600', flex: 1,
  },
  timestamp: {
    fontSize: 12, color: '#8E8E93', marginLeft: 8,
  },
  bottomRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14, color: '#8E8E93', flex: 1,
  },
  unreadIndicator: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#FF3B30', marginLeft: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
});
