import * as React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";

export default function SafeView(props) {
  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView
        behavior="padding"
        enabled
        keyboardVerticalOffset={10}
        style={[styles.container, props.containerStyle]}
      >
        <SafeAreaView {...props} style={[styles.container, props.style]}>
          {props.children}
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  } else {
    return (
      <SafeAreaView {...props} style={[styles.container, props.style]}>
        {props.children}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
});
