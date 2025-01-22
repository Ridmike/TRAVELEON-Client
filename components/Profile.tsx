import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text, Alert, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Profile = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState<any>({});

  // Request permission to access the media library
  const requestPermission = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert("You need to enable permission to access the library...");
    }
  };

  // Fetch user details from Firestore
  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "usersForign", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        setUpdatedData(userDoc.data());
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Could not fetch user details.");
    }
  };

  // Update user data in Firestore
  const handleSave = async () => {
    if (!auth.currentUser) return;

    try {
      await updateDoc(doc(db, "usersForign", auth.currentUser.uid), updatedData);
      setUserData(updatedData);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    }
  };

  // Handle profile image selection
  const selectProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
      });

      if (!result.canceled && result.assets) {
        const selectedUri = result.assets[0].uri;
        setProfileImage(selectedUri);
        setUpdatedData({ ...updatedData, profileImage: selectedUri });
      }
    } catch (error) {
      console.log("Error selecting image:", error);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchUserData(auth.currentUser.uid);
    }
    requestPermission();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.imageContainer} onPress={selectProfileImage}>
              <Image
                source={{
                  uri: profileImage || userData?.profileImage || "https://via.placeholder.com/150",
                }}
                style={styles.profileImage}
              />
              <View style={styles.editImageBadge}>
                <Text style={styles.editImageText}>Edit</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.nameContainer}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={updatedData.name}
                onChangeText={(text) => setUpdatedData({ ...updatedData, name: text })}
                placeholderTextColor="#777"
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.name}>{userData?.name || "N/A"}</Text>
            )}
            <Text style={styles.email}>{userData?.email || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Passport Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={updatedData.passportNumber}
                onChangeText={(text) => setUpdatedData({ ...updatedData, passportNumber: text })}
                placeholder="Enter passport number"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.detailValue}>{userData?.passportNumber || "Not provided"}</Text>
            )}
          </View>
        </View>

        <View style={styles.actionContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setUpdatedData(userData);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => auth.signOut()}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  editImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  nameContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
    textAlign: 'center',
  },
  nameInput: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: '#3498db',
    textAlign: 'center',
    padding: 8,
    width: '100%',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#777",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailItem: {
    flexDirection: "column",
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  input: {
    backgroundColor: "#f7f9fc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e1e5eb",
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  editButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2ecc71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dfe4ea",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777",
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e74c3c",
  },
});