import { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  BackHandler,
  Alert,
  Modal,
  Button,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import * as SplashScreen from "expo-splash-screen";
import SafeView from "./components/SafeView";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const webview = useRef(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const [backCount, setBackCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      setTimeout(() => {
        setBackCount(0);
      }, 2000);

      if (backCount === 0) {
        setBackCount(backCount + 1);
        webview.current.goBack();
        return true;
      } else if (backCount === 1) {
        Alert.alert(
          "앱종료",
          "앱을 종료하시겠습니까??",
          [
            { text: "취소", onPress: () => {}, style: "cancel" },
            {
              text: "종료",
              onPress: async () => {
                localData.isExit = true;
                BackHandler.exitApp();
              },
            },
          ],
          { cancelable: false }
        );
        return true;
      } else {
        return false;
      }
    });
    // return () => BackHandler.remove();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeView>
      <WebView
        ref={webview}
        style={styles.container}
        source={{ uri: "https://app.mosazzi.com/" }}
      />
    </SafeView>
  );
}

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);

    // axios.defaults.headers = {
    //   Authorization: `Bearer ${getAccessToken()}`,
    // };
    // try {
    //   const res = await axios.post(
    //     `https://api.mosazzi.com/api/app/firebase/token`,
    //     {
    //       token: token,
    //     }
    //   );
    //   console.log(res);
    //   return res;
    // } catch (err) {
    //   return console.log(err);
    // }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  modalContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(23, 29, 35, 0.7)",
  },
  modalContentsContainer: {
    width: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: 46,
    height: 200,
    borderRadius: 6,
  },
  modalButtonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 34,
  },
  updateButton: {
    backgroundColor: "#5B43EF",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderTopLeftRadius: 0,
    borderTopRighttRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 6,
  },
  closeButton: {
    backgroundColor: "#F7F8F9",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderTopLeftRadius: 0,
    borderTopRighttRadius: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 0,
  },
});

// {version !== "1.0.0" && (
//   <Modal
//     animationType="fade"
//     transparent={true}
//     visible={modalVisible}
//     onRequestClose={() => {
//       setModalVisible(false);
//     }}
//   >
//     <View style={styles.modalContainer}>
//       <View style={styles.modalContentsContainer}>
//         <Text style={{ fontSize: 14, lineHeight: 22, color: "#3A4552" }}>
//           새로운 버전이 업데이트되었어요
//         </Text>
//         <Text style={{ fontSize: 14, lineHeight: 22, color: "#3A4552" }}>
//           앱마켓으로 이동합니다
//         </Text>
//         <View style={styles.modalButtonContainer}>
//           <TouchableOpacity
//             onPress={() => setModalVisible(false)}
//             style={styles.closeButton}
//           >
//             <Text
//               style={{
//                 fontSize: 16,
//                 fontWeight: "bold",
//                 color: "#2A323B",
//               }}
//             >
//               다음에 하기
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => Linking.openURL("naver.com")}
//             style={styles.updateButton}
//           >
//             <Text
//               style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
//             >
//               업데이트하기
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   </Modal>
// )}
