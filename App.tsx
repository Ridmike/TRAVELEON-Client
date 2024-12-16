import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './app/HomeScreen';
import AccommodationDetailsScreen from './screens/AccomodationDetailsScreen';
import VehicleDetailsScreen from './screens/VehicleDetailsScreen';
import TourGuidesInformation from './screens/TourGuidesInformation';
import RestaurantDetailsScreen from './screens/RestaurentDetailsScreen';
import EmergencyServicesDetailsScreen from './screens/EmergencyServicesDetailsScreen';
import AdventureSportsDetailsScreen from './screens/AdventureSportsDetailsScreen';
// import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
// import DetailsLocation from './screens/DetailsLocation';
// import LoginScreen from './screens/LoginScreen';
// import RegisterScreen from './screens/RegisterScreen';
// import Profile from './components/Profile';
// import ChatScreen from './screens/ChatScreen';
// import ChatRoomListScreen from './components/ChatRoomList';

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  ForgotPassword: undefined;
  Details: { location: { id: string; name: string; type: string; image: string; description: string; latitude: number; longitude: number } };
  Login: undefined;
  Register: undefined;
  AccommodationDetailsScreen: { details: any[]; subTopic: string; headerTitle: string };
  TourGuidesInformation: { details: any[]; subTopic: string; headerTitle: string };
  RestaurantDetailsScreen: { details: any[]; subTopic: string; headerTitle: string };
  EmergencyServicesDetailsScreen: { details: any[] };
  VehicleDetailsScreen: { details: any[]; subTopic: string; headerTitle: string };
  AdventureSportsDetailsScreen: { details: any[]; subTopic: string; headerTitle: string };
  ChatRoomList: undefined;
  ChatScreen: { chatRoomId: string; sellerName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          {/* <Stack.Screen name='Profile' component={Profile} options={{ headerTitle: '', headerBackTitleVisible: false }} /> */}
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
          {/* <Stack.Screen name="Details" component={DetailsLocation} options={{ headerTitle: '', headerBackTitleVisible: false }} />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerTitle: '', headerBackTitleVisible: false,  }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerTitle: '', headerBackTitleVisible: false }}
          /> */}
          <Stack.Screen
            name="AccommodationDetailsScreen"
            component={AccommodationDetailsScreen}
            options={({ route }: any) => ({
              headerTitle: route.params?.headerTitle || '',
            })}
            initialParams={{ details: [], subTopic: '', headerTitle: '' }}
          />


          <Stack.Screen
            name="VehicleDetailsScreen"
            component={VehicleDetailsScreen}
            options={({ route }: any) => ({
              headerTitle: route.params?.headerTitle || '', 
            })}
            initialParams={{ details: [], subTopic: '', headerTitle: '' }}
          />
          <Stack.Screen
            name="TourGuidesInformation"
            component={TourGuidesInformation}
            options={({ route }: any) => ({
              headerTitle: route.params?.headerTitle || '',
            })}
            initialParams={{ details: [], subTopic: '', headerTitle: '' }}
          />
          <Stack.Screen
            name="RestaurantDetailsScreen"
            component={RestaurantDetailsScreen}
            options={({ route }: any) => ({
              headerTitle: route.params?.headerTitle || '', // Set header title dynamically
            })}
            initialParams={{ details: [], subTopic: '', headerTitle: '' }}
          />
          <Stack.Screen
            name="EmergencyServicesDetailsScreen"
            component={EmergencyServicesDetailsScreen}
            options={({ route }: any) => ({
              headerTitle: route.params?.headerTitle || '', 
            })}
          />
          <Stack.Screen
            name="AdventureSportsDetailsScreen"
            component={AdventureSportsDetailsScreen}
            initialParams={{ details: [], subTopic: '', headerTitle: '' }}
            options={({ route }) => ({
              title: route.params?.subTopic || 'Adventure Sports',
            })}
          />
          {/* <Stack.Screen
            name="ChatRoomList"
            component={ChatRoomListScreen}
            options={{ title: "Your Chat Rooms" }}
          /> */}
          {/* <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: "Chat" }} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
