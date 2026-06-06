import { Tabs } from "expo-router";
import {
  Handshake,
  MessageSquare,
  Search,
  Tag,
  User,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { LaneStripe } from "~/components/LaneStripe";
import { mobileTheme } from "~/theme/mobileTheme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: mobileTheme.colors.action.primaryBg,
        tabBarInactiveTintColor: mobileTheme.colors.text.onDarkMuted,
        tabBarLabelStyle: {
          fontFamily: mobileTheme.fonts.medium,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: mobileTheme.colors.surface.canvas,
          borderTopColor: mobileTheme.colors.border.onDark,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={styles.stripe}>
              <LaneStripe
                segments={5}
                completedSegments={3}
                currentSegment={3}
              />
            </View>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: ({ color, size }) => <Tag color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <MessageSquare color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: "Deals",
          tabBarIcon: ({ color, size }) => (
            <Handshake color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    backgroundColor: mobileTheme.colors.surface.canvas,
    flex: 1,
  },
  stripe: {
    left: mobileTheme.spacing[5],
    position: "absolute",
    right: mobileTheme.spacing[5],
    top: mobileTheme.spacing[1],
  },
});
