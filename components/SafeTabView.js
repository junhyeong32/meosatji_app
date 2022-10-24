import * as React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  KeyboardAvoidingView,
} from "react-native";

import {
  initialWindowSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Container, Root } from "native-base";

export default function SafeTabView(props) {
  if (Platform.OS === "ios") {
    const insets = initialWindowSafeAreaInsets;

    return (
      <KeyboardAvoidingView
        behavior="padding"
        enabled
        keyboardVerticalOffset={10}
        style={[styles.container]}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <Container {...props} style={[styles.container]}>
            {props.children}
          </Container>
        </View>
      </KeyboardAvoidingView>
    );
  } else {
    return (
      <SafeAreaView {...props} style={[styles.container]}>
        <Container {...props} style={[styles.container]}>
          {props.children}
        </Container>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
