import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, } from "react-native";
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail, } from "firebase/auth";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handlePasswordReset = () => {
    const auth = getAuth();
    setErrorMessage(""); 
    if (email.trim() === "") {
      setErrorMessage("Please enter your email address.");
      return;
    }

    // Check if the email is registered
    fetchSignInMethodsForEmail(auth, email)
      .then((signInMethods) => {
        if (signInMethods.length === 0) {
          setErrorMessage(
            "No account is associated with this email. Please check the email or sign up."
          );
        } else {
          // Email exists, proceed to send reset email
          sendPasswordResetEmail(auth, email)
            .then(() => {
              setErrorMessage(""); // Clear error message
              alert(
                "Password Reset Email Sent. Please check your email to reset your password."
              );
              setEmail(""); // Clear the input field
            })
            .catch((error) => {
              switch (error.code) {
                case "auth/invalid-email":
                  setErrorMessage("Please enter a valid email address.");
                  break;
                case "auth/too-many-requests":
                  setErrorMessage(
                    "Too many requests. Please try again later."
                  );
                  break;
                default:
                  setErrorMessage(
                    "An unexpected error occurred. Please try again."
                  );
              }
            });
        }
      })
      
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address below to receive a password reset link.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#F2BB16",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
