import * as ImagePicker from 'expo-image-picker';
import { View, TouchableOpacity, Text, Modal, Animated, StyleSheet, Dimensions, Image, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

export const ModelCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [placeResult, setPlaceResult] = useState({ place: '', description: '' });
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowResult(false));
  };

  const handleExplore = async () => {
    try {
      setIsLoading(true);
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Camera access is needed to explore.");
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        setIsLoading(false);
        return;
      }

      const photo = result.assets[0];
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch('http://10.16.131.9:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.place) {
        setPlaceResult({
          place: data.place,
          description: data.description,
        });
        setShowResult(true);
        animateIn();
      } else {
        setPlaceResult({
          place: 'Location Not Found',
          description: 'The model could not detect a known location.',
        });
        setShowResult(true);
        animateIn();
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Prediction error:', error);
      setPlaceResult({
        place: 'Error',
        description: 'Something went wrong while predicting the image.',
      });
      setShowResult(true);
      animateIn();
    }
  };

  return (
    <>
      <TouchableOpacity
        style={{
          backgroundColor: '#FFF',
          borderRadius: 16,
          padding: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
        activeOpacity={0.8}
        onPress={handleExplore}
        disabled={isLoading}
      >
        <Ionicons name="scan-outline" size={24} color="#24BAEC" />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#24BAEC',
            marginLeft: 8,
          }}
        >
          {isLoading ? "Processing..." : "Explore"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showResult}
        transparent={true}
        animationType="none"
        onRequestClose={animateOut}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                {placeResult.place === 'Error' ? (
                  <Ionicons name="alert-circle" size={32} color="#FF3B30" />
                ) : placeResult.place === 'Location Not Found' ? (
                  <Ionicons name="search" size={32} color="#FF9500" />
                ) : (
                  <Ionicons name="location" size={32} color="#24BAEC" />
                )}
              </View>
              <Text style={styles.headerText}>{placeResult.place}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.description}>{placeResult.description}</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={animateOut}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: Dimensions.get('window').width - 40,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    width: '100%',
    marginVertical: 15,
  },
  description: {
    fontSize: 16,
    color: '#48484A',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeButton: {
    backgroundColor: '#24BAEC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
