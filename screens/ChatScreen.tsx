import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { useRoute, useNavigation } from "@react-navigation/native";
import moment from "moment";
import { Ionicons } from '@expo/vector-icons'; 

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const route = useRoute();
  const navigation = useNavigation();
  const { chatRoomId, sellerName } = route.params as {
    chatRoomId: string;
    sellerName: string;
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide the default header
    });
  }, [navigation, sellerName]);

  useEffect(() => {
    const q = query(
      collection(db, "chatRooms", chatRoomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          formattedTime: moment(data.createdAt).format("h:mm"),
        };
      });
      setMessages(loadedMessages);
    });

    return unsubscribe;
  }, [chatRoomId]);

  const getUserName = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "usersForign", uid));
      if (userDoc.exists()) {
        return userDoc.data()?.name || "Unknown User";
      }
      return "Unknown User";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "Unknown User";
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const senderName = await getUserName(currentUser.uid);

    const messageData = {
      text: newMessage,
      senderId: currentUser.uid,
      senderName: senderName,
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "chatRooms", chatRoomId, "messages"), messageData);

    setNewMessage("");
  };

  // Custom render for the date separator
  const renderDateSeparator = () => {
    return (
      <View style={styles.dateSeparator}>
        <Text style={styles.dateSeparatorText}>Today</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{sellerName}</Text>
          <Text style={styles.headerSubtitle}>Active Now</Text>
        </View>
        
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.messagesContainer}>
          {renderDateSeparator()}
          
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isCurrentUser = item.senderId === getAuth().currentUser?.uid;
              return (
                <View
                  style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.sentMessage : styles.receivedMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{item.text}</Text>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.formattedTime}</Text>
                    {isCurrentUser && (
                      <Ionicons name="checkmark-done" size={14} color="#34B7F1" style={styles.checkIcon} />
                    )}
                  </View>
                </View>
              );
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={(text) => setNewMessage(text)}
            placeholder="Type you message"
            multiline={true}
          />
          
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="mic" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff"
  },
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8"
  },
  backButton: {
    padding: 5
  },
  headerContent: {
    flex: 1,
    marginLeft: 10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600"
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4CAF50"
  },
  callButton: {
    padding: 10
  },
  messagesContainer: {
    flex: 1,
    padding: 10
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 15
  },
  dateSeparatorText: {
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 14,
    color: "#888"
  },
  messageContainer: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 4,
    maxWidth: "80%"
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#E6F7FF"  // Light blue bubble for sent messages
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F2F2"  // Light gray bubble for received messages
  },
  messageText: {
    fontSize: 16,
    color: "#333"
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 2
  },
  timeText: {
    fontSize: 10,
    color: "#888",
    marginRight: 2
  },
  checkIcon: {
    marginLeft: 2
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    backgroundColor: "#fff"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    backgroundColor: "#F9F9F9"
  },
  attachButton: {
    padding: 10
  },
  sendButton: {
    backgroundColor: "#00BCD4",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5
  },
  // Scroll container styles - maintained from your original code but adjusted
  Scrollcontainer: {
    padding: 10,
  },
  // Button styles from your original code (maintained for compatibility)
  button: {
    backgroundColor: "#F2BB16",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  senderText: {
    fontSize: 12,
    color: "#007BFF",
    fontWeight: "bold",
    marginBottom: 2,
  }
});