import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AuthStack";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function AboutUsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const teamMembers = ["Arjit Kumar", "Jasmeet Singh", "Devyn Weir"];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("Auth");
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.appName}>Expense Manager App</Text>
          <Text style={styles.groupName}>by Dev Warriors</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.description}>
            We are happy to get this opportunity and build this meaningful project. All the members contributed thoroughly throughout the semester and ensured to divide work equally. We are obliged to have this opportunity to showcase our skills, we learned this semester and putting them to work. Our goal is to help users track
            their expenses efficiently and make better financial decisions through our intuitive expense management
            application.
          </Text>
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet the Team</Text>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>
                  {member
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </Text>
              </View>
              <Text style={styles.memberName}>{member}</Text>
            </View>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the App</Text>
          <Text style={styles.description}>
            The Expense Manager App is designed to help you take control of your finances. Track your income, monitor
            your expenses, and get insights into your spending patterns with our user-friendly interface.
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        </View>        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  section: {
    marginBottom: 30,
    width: "100%",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 5,
  },
  groupName: {
    fontSize: 18,
    color: "#3B82F6",
    textAlign: "center",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
    textAlign: "justify",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  memberInitial: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#DC2626",
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
