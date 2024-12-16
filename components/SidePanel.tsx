import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions, StatusBar, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { combinedDataset } from '../data/SidePanelDataSet';
import { Ionicons } from '@expo/vector-icons';

interface SidePanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ isVisible, onClose }) => {
  const [expandedTopics, setExpandedTopics] = useState<{ [key: number]: boolean }>({});
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isVisible) {
      setExpandedTopics({}); // Close all dropdowns when panel opens

      // Opening animations
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
    } else {
      // Closing animations
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -400,
          useNativeDriver: true,
          friction: 12,
          tension: 30,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, fadeAnim, scaleAnim]);

  if (!isVisible) return null;

  const toggleExpand = (index: number) => {
    setExpandedTopics((prev) => {
      if (prev[index]) {
        return {};
      }
      return { [index]: true };
    });
  };

  const handleSubTopicPress = (topicTitle: string, subTopic: string) => {
    const params = { subTopic, headerTitle: subTopic, details: [] };

    if (topicTitle === 'Accommodation') {
      navigation.navigate('AccommodationDetailsScreen', params);
    } else if (topicTitle === 'Vehicle Rent') {
      navigation.navigate('VehicleDetailsScreen', params);
    } else if (topicTitle === 'Tour Guides') {
      navigation.navigate('TourGuidesInformation', params);
    } else if (topicTitle === 'Restaurant') {
      navigation.navigate('RestaurantDetailsScreen', params);
    } else if (topicTitle === 'Emergency Services') {
      navigation.navigate('EmergencyServicesDetailsScreen', params);
    } else if (topicTitle === 'Adventure Sports') {
      navigation.navigate('AdventureSportsDetailsScreen', params);
    }

    onClose();
  };

  const getCategoryIcon = (title: string) => {
    switch (title) {
      case 'Accommodation': return 'bed-outline';
      case 'Vehicle Rent': return 'car-outline';
      case 'Tour Guides': return 'people-outline';
      case 'Restaurant': return 'restaurant-outline';
      case 'Emergency Services': return 'medkit-outline';
      case 'Adventure Sports': return 'bicycle-outline';
      default: return 'list-outline';
    }
  };

  return (
    <>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.spacer}></View>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionContainer}>
              {combinedDataset.map((topic, index) => (
                <View key={index} style={styles.topicContainer}>
                  <TouchableOpacity
                    style={[
                      styles.topicTitleContainer,
                      expandedTopics[index] && styles.expandedTopicTitle,
                    ]}
                    onPress={() => toggleExpand(index)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.topicTitleContent}>
                      <View style={styles.iconContainer}>
                        <Ionicons name={getCategoryIcon(topic.title)} size={22} color="#FFF" />
                      </View>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                    </View>
                    <Ionicons
                      name={expandedTopics[index] ? 'chevron-up' : 'chevron-down'}
                      size={22}
                      color="white"
                    />
                  </TouchableOpacity>

                  {expandedTopics[index] && (
                    <View style={styles.subTopicsContainer}>
                      {topic.subTopics.map((subTopic, subIndex) => (
                        <View key={subIndex} style={styles.subTopicWrapper}>
                          <View style={styles.verticalLine} />
                          <View style={styles.horizontalLineContainer}>
                            <View style={styles.horizontalLine} />
                          </View>
                          <TouchableOpacity
                            style={styles.subTopicButton}
                            onPress={() => handleSubTopicPress(topic.title, subTopic)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.subTopicText}>{subTopic}</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.exploreButton} activeOpacity={0.8}>
              <Ionicons name="scan-outline" size={24} color="#24BAEC" />
              <Text style={styles.exploreText}>Explore</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

export default SidePanel;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '85%',
    height: Platform.OS === 'android'
      ? Dimensions.get('window').height + StatusBar.currentHeight!
      : Dimensions.get('window').height,
    backgroundColor: '#24BAEC',
    zIndex: 1000,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  sectionContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 20,
  },
  topicContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  topicTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  expandedTopicTitle: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  topicTitleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  subTopicsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingTop: 5,
    paddingBottom: 8,
  },
  subTopicWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    left: 27,
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  horizontalLineContainer: {
    width: 20,
    height: 40,
    justifyContent: 'center',
    marginLeft: 17,
  },
  horizontalLine: {
    height: 2,
    width: 15,
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  subTopicButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 15,
    borderRadius: 8,
    marginVertical: 2,
    flex: 1,
  },
  subTopicText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  exploreButton: {
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
  },
  exploreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#24BAEC',
    marginLeft: 8,
  },
});
