import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

// Define the type for an individual emergency service item
interface EmergencyServiceItem {
  serviceType: string;
  location: string;
  contactNumber: string;
  serviceHours: string;
}

const EmergencyServicesDetailsScreen: React.FC<{ route: any }> = ({ route }) => {
  const { details }: { details: EmergencyServiceItem[] } = route.params;

  if (!details || details.length === 0) {
    return (
    <View style={styles.noDetailsContainer}>
      <Text style={styles.noDetailsText}>No emergency services details available.</Text>
    </View>);
  }

  return (
    <ScrollView style={styles.container}>
      {details.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{item.serviceType}</Text>
          <Text style={styles.text}>Location: {item.location}</Text>
          <Text style={styles.text}>Contact: {item.contactNumber}</Text>
          <Text style={styles.text}>Service Hours: {item.serviceHours}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default EmergencyServicesDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#BAD9CE",
  },
  card: {
    backgroundColor: "#61A88F",
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  noDetailsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#BAD9CE",
  },
  noDetailsText: {
    fontSize: 18,
    // color: "#FFFFFF",
    fontWeight: "bold",
  },
});
