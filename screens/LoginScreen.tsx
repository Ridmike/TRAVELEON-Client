import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-email':
          Alert.alert('Login Failed', 'The email address is not valid.');
          break;
        case 'auth/user-disabled':
          Alert.alert('Login Failed', 'This user account has been disabled.');
          break;
        case 'auth/user-not-found':
          Alert.alert('Login Failed', 'No user found with this email.');
          break;
        case 'auth/wrong-password':
          Alert.alert('Login Failed', 'The password is incorrect.');
          break;
        default:
          Alert.alert('Login Failed', 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    
    <View style={styles.container}>
      <ScrollView >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      
      <Image source={require('../assets/Vector.png')} style={styles.logo} />
      
      <Text style={styles.title}>Sign in now</Text>
      <Text style={styles.subtitle}>Please sign in to continue our app</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
          <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.forgotPasswordContainer} 
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgotPassword}>Forget Password?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>
      
      <View style={styles.signUpContainer}>
        <Text style={styles.noAccountText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('Register')}>
          <Text style={styles.signUpText}>Sign up</Text>
        </TouchableOpacity>
      </View>
      
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPassword: {
    color: '#ff7e1a',
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#29B6F6',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signInText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  noAccountText: {
    fontSize: 16,
    color: 'gray',
  },
  signUpText: {
    fontSize: 16,
    color: '#ff7e1a',
    fontWeight: 'bold',
  },
  orConnectText: {
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  divider: {
    height: 5,
    width: 120,
    backgroundColor: '#000',
    alignSelf: 'center',
    borderRadius: 2.5,
  },
});