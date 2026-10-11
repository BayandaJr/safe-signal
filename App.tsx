import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Contact = { id: string; name: string; phone: string };
type IncidentStatus = "active" | "acknowledged" | "escalated" | "closed";
type Incident = {
  id: string;
  createdAt: string;
  status: IncidentStatus;
  acknowledgedBy?: string;
  escalatedAt?: string;
};

const COLORS = {
  navy: "#142C38",
  navy2: "#213F4C",
  coral: "#F47758",
  bg: "#F4F7F8",
  white: "#FFFFFF",
  text: "#172B34",
  muted: "#637781",
  border: "#DCE5E8",
  green: "#217A55",
  paleCoral: "#FFF0EB",
};

function ActionButton({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.82}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && styles.buttonSecondaryText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function App() {
  const [screen, setScreen] = useState<"home" | "contacts" | "community">("home");
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "contact-1", name: "Alex (demo contact)", phone: "071 000 0000" },
  ]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [incident, setIncident] = useState<Incident | null>(null);
  const [responderName, setResponderName] = useState("Demo trusted contact");

  const statusLabel = useMemo(() => {
    if (!incident) return "No active incident";
    switch (incident.status) {
      case "active": return "Alert created · awaiting acknowledgement";
      case "acknowledged": return `Acknowledged by ${incident.acknowledgedBy ?? "a trusted contact"}`;
      case "escalated": return "Explicitly escalated to demo community queue";
      case "closed": return "Incident closed";
    }
  }, [incident]);

  function createIncident() {
    if (contacts.length === 0) {
      Alert.alert("Add a trusted contact", "Add at least one trusted contact before starting the demo SOS flow.");
      setScreen("contacts");
      return;
    }
    if (incident && incident.status !== "closed") {
      Alert.alert("Incident already active", "Close the current demo incident before creating another.");
      return;
    }
    const now = new Date();
    const id = `SS-${now.getTime().toString().slice(-7)}`;
    setIncident({ id, createdAt: now.toLocaleString(), status: "active" });
    setScreen("home");
    Alert.alert(
      "Demo alert created",
      `Incident ${id} has been created locally. No SMS, push notification, emergency call, or real responder dispatch has occurred.`
    );
  }

  function acknowledgeIncident() {
    if (!incident || incident.status !== "active") return;
    setIncident({ ...incident, status: "acknowledged", acknowledgedBy: responderName.trim() || "Demo responder" });
  }

  function escalateIncident() {
    if (!incident || incident.status === "closed" || incident.status === "escalated") return;
    Alert.alert(
      "Escalate to community support?",
      "This demo will place the incident in a local simulated queue. It will not contact real volunteers or share a real location.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Escalate",
          style: "destructive",
          onPress: () => setIncident({ ...incident, status: "escalated", escalatedAt: new Date().toLocaleString() }),
        },
      ]
    );
  }

  function closeIncident() {
    if (!incident || incident.status === "closed") return;
    Alert.alert("Close demo incident?", "This marks the simulated incident as closed.", [
      { text: "Keep open", style: "cancel" },
      { text: "Close incident", onPress: () => setIncident({ ...incident, status: "closed" }) },
    ]);
  }

  function addContact() {
    const name = contactName.trim();
    const phone = contactPhone.trim();
    if (!name || !phone) {
      Alert.alert("Missing details", "Enter a contact name and phone number.");
      return;
    }
    setContacts((previous) => [...previous, { id: `${Date.now()}`, name, phone }]);
    setContactName("");
    setContactPhone("");
    Alert.alert("Contact added", "This contact is stored in app memory for this demo session only.");
  }

  function removeContact(id: string) {
    Alert.alert("Remove contact?", "Remove this contact from your demo trusted circle?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setContacts((previous) => previous.filter((c) => c.id !== id)) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <View style={styles.header}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>S</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>SAFE SIGNAL</Text>
          <Text style={styles.tagline}>One signal. Trusted people. Faster help.</Text>
        </View>
      </View>

      <View style={styles.nav}>
        {([
          ["home", "Home"],
          ["contacts", "Trusted circle"],
          ["community", "Community"],
        ] as const).map(([key, label]) => (
          <TouchableOpacity key={key} onPress={() => setScreen(key)} style={[styles.navItem, screen === key && styles.navItemActive]}>
            <Text style={[styles.navText, screen === key && styles.navTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {screen === "home" && (
          <>
            <View style={styles.welcome}>
              <Text style={styles.eyebrow}>YOUR SAFETY, YOUR CHOICES</Text>
              <Text style={styles.h1}>Help should be easier to reach.</Text>
              <Text style={styles.body}>Create a demo alert for your trusted circle. Community escalation is always a separate, explicit action.</Text>
            </View>

            <View style={styles.sosCard}>
              <View style={styles.sosIcon}><Text style={styles.sosIconText}>!</Text></View>
              <Text style={styles.sosTitle}>Need help?</Text>
              <Text style={styles.sosDescription}>Start a simulated SOS incident and follow its response status.</Text>
              <ActionButton title="CREATE DEMO SOS" onPress={createIncident} />
              <Text style={styles.smallLight}>Demo only — this does not contact emergency services.</Text>
            </View>

            <SectionTitle>Incident status</SectionTitle>
            <View style={styles.card}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, incident && incident.status !== "closed" ? styles.statusDotActive : null]} />
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
              {incident ? (
                <>
                  <Text style={styles.meta}>Incident ID: {incident.id}</Text>
                  <Text style={styles.meta}>Created: {incident.createdAt}</Text>
                  <View style={styles.timeline}>
                    <TimelineItem title="Signal" detail="Incident created in this device's app state." complete />
                    <TimelineItem title="Acknowledge" detail={incident.acknowledgedBy ? `Acknowledged by ${incident.acknowledgedBy}.` : "Waiting for a trusted contact in the demo."} complete={!!incident.acknowledgedBy} />
                    <TimelineItem title="Community escalation" detail={incident.status === "escalated" ? `Escalated at ${incident.escalatedAt}.` : "Not shared with community responders."} complete={incident.status === "escalated"} />
                    <TimelineItem title="Close" detail={incident.status === "closed" ? "Incident marked closed." : "Close after the demo response is complete."} complete={incident.status === "closed"} last />
                  </View>
                  <Text style={styles.fieldLabel}>Simulate trusted contact acknowledgement</Text>
                  <TextInput value={responderName} onChangeText={setResponderName} placeholder="Responder display name" style={styles.input} />
                  <ActionButton title="ACKNOWLEDGE AS TRUSTED CONTACT" onPress={acknowledgeIncident} disabled={incident.status !== "active"} />
                  <View style={{ height: 8 }} />
                  <ActionButton title="ESCALATE TO COMMUNITY QUEUE" onPress={escalateIncident} secondary disabled={incident.status === "closed" || incident.status === "escalated"} />
                  <View style={{ height: 8 }} />
                  <ActionButton title="CLOSE INCIDENT" onPress={closeIncident} secondary disabled={incident.status === "closed"} />
                </>
              ) : (
                <Text style={styles.body}>When you create a demo SOS, its status and response steps will appear here.</Text>
              )}
            </View>

            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>Safety first</Text>
              <Text style={styles.noticeText}>This prototype does not send real alerts, share GPS location, contact police, or dispatch volunteers. Do not use it as an emergency service.</Text>
            </View>
          </>
        )}

        {screen === "contacts" && (
          <>
            <Text style={styles.h1}>My Trusted Circle</Text>
            <Text style={styles.body}>Add people you choose to be part of your personal safety plan. A real release must verify contact consent and use secure storage.</Text>
            <View style={styles.card}>
              <SectionTitle>Add a contact</SectionTitle>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput value={contactName} onChangeText={setContactName} placeholder="e.g. Sam" style={styles.input} autoCapitalize="words" />
              <Text style={styles.fieldLabel}>Phone number</Text>
              <TextInput value={contactPhone} onChangeText={setContactPhone} placeholder="e.g. 07..." style={styles.input} keyboardType="phone-pad" />
              <ActionButton title="ADD TRUSTED CONTACT" onPress={addContact} />
            </View>
            <SectionTitle>Your contacts ({contacts.length})</SectionTitle>
            {contacts.length === 0 ? <View style={styles.card}><Text style={styles.body}>No contacts added yet.</Text></View> : contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{contact.name.slice(0, 1).toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.meta}>{contact.phone}</Text>
                </View>
                <TouchableOpacity onPress={() => removeContact(contact.id)} accessibilityRole="button">
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {screen === "community" && (
          <>
            <Text style={styles.h1}>Community Support</Text>
            <Text style={styles.body}>Only incidents explicitly escalated by the user should enter this queue. Responders must be verified and approved before receiving real incidents.</Text>
            <View style={styles.card}>
              <View style={styles.communityHeader}>
                <View style={styles.communityIcon}><Text style={styles.communityIconText}>✓</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Responder status</Text>
                  <Text style={styles.meta}>Prototype mode · no real responder accounts</Text>
                </View>
              </View>
              <Text style={styles.fieldLabel}>Demo queue</Text>
              {incident?.status === "escalated" ? (
                <>
                  <Text style={styles.queueTitle}>Incident {incident.id}</Text>
                  <Text style={styles.body}>An incident has been explicitly escalated in this local demo. No real identity or GPS coordinates are attached.</Text>
                  <View style={styles.pill}><Text style={styles.pillText}>SIMULATED QUEUE ITEM</Text></View>
                </>
              ) : (
                <Text style={styles.body}>No escalated incidents. Create a demo SOS, then explicitly choose “Escalate to community queue” to see it here.</Text>
              )}
            </View>
            <View style={styles.card}>
              <SectionTitle>Become a responder</SectionTitle>
              <Text style={styles.body}>Future flow: apply → identity/role checks → safeguarding training → administrator approval → set availability. Registration alone will never grant access to incidents.</Text>
              <View style={styles.pill}><Text style={styles.pillText}>PLANNED FEATURE</Text></View>
            </View>
          </>
        )}

        <Text style={styles.footer}>SAFE SIGNAL · HACKATHON PROTOTYPE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineItem({ title, detail, complete, last = false }: { title: string; detail: string; complete: boolean; last?: boolean }) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, complete && styles.timelineDotComplete]} />
        {!last && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineCopy}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.meta}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.navy, paddingHorizontal: 18, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  brandMark: { width: 42, height: 42, borderRadius: 13, backgroundColor: COLORS.coral, alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: COLORS.white, fontSize: 24, fontWeight: "900" },
  brand: { color: COLORS.white, fontWeight: "900", fontSize: 18, letterSpacing: 1.4 },
  tagline: { color: "#C8D8DE", fontSize: 11, marginTop: 3 },
  nav: { flexDirection: "row", backgroundColor: COLORS.white, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navItem: { flex: 1, paddingVertical: 13, alignItems: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  navItemActive: { borderBottomColor: COLORS.coral },
  navText: { fontSize: 12, fontWeight: "600", color: COLORS.muted },
  navTextActive: { color: COLORS.navy, fontWeight: "800" },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  welcome: { paddingTop: 6, gap: 7 },
  eyebrow: { color: COLORS.coral, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  h1: { color: COLORS.text, fontSize: 27, lineHeight: 33, fontWeight: "900" },
  body: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  sosCard: { backgroundColor: COLORS.navy, borderRadius: 22, padding: 20, alignItems: "center", gap: 10 },
  sosIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.coral, alignItems: "center", justifyContent: "center" },
  sosIconText: { color: COLORS.white, fontSize: 30, fontWeight: "900" },
  sosTitle: { color: COLORS.white, fontSize: 22, fontWeight: "900" },
  sosDescription: { color: "#D0DEE3", fontSize: 13, lineHeight: 19, textAlign: "center" },
  smallLight: { color: "#D0DEE3", fontSize: 10, textAlign: "center" },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#9AAAB0" },
  statusDotActive: { backgroundColor: COLORS.coral },
  statusText: { color: COLORS.text, fontWeight: "800", fontSize: 14, flex: 1 },
  meta: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  timeline: { marginTop: 4, marginBottom: 2 },
  timelineItem: { flexDirection: "row", minHeight: 52 },
  timelineRail: { width: 22, alignItems: "center" },
  timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#B8C7CC", backgroundColor: COLORS.white, zIndex: 1 },
  timelineDotComplete: { borderColor: COLORS.green, backgroundColor: COLORS.green },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 2, marginBottom: -2 },
  timelineCopy: { flex: 1, paddingBottom: 12, gap: 3 },
  timelineTitle: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  fieldLabel: { color: COLORS.text, fontSize: 12, fontWeight: "800", marginBottom: -6 },
  input: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 12, color: COLORS.text, fontSize: 14 },
  button: { minHeight: 46, borderRadius: 12, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  buttonPrimary: { backgroundColor: COLORS.coral },
  buttonSecondary: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  buttonDisabled: { backgroundColor: "#E5EAEC", borderColor: "#E5EAEC" },
  buttonText: { color: COLORS.white, fontWeight: "900", fontSize: 12, letterSpacing: 0.3, textAlign: "center" },
  buttonSecondaryText: { color: COLORS.navy },
  disabledText: { color: "#8A999F" },
  notice: { backgroundColor: COLORS.paleCoral, borderRadius: 14, padding: 14, gap: 5, borderWidth: 1, borderColor: "#F8D1C4" },
  noticeTitle: { color: "#963C24", fontWeight: "900", fontSize: 13 },
  noticeText: { color: "#794B40", fontSize: 12, lineHeight: 18 },
  contactCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.white, padding: 13, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#E6EFF2", alignItems: "center", justifyContent: "center" },
  avatarText: { color: COLORS.navy, fontSize: 16, fontWeight: "900" },
  contactName: { color: COLORS.text, fontWeight: "800", fontSize: 14 },
  removeText: { color: "#B42318", fontSize: 12, fontWeight: "800" },
  communityHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  communityIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#DDF3E8", alignItems: "center", justifyContent: "center" },
  communityIconText: { color: COLORS.green, fontSize: 22, fontWeight: "900" },
  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: "900" },
  queueTitle: { color: COLORS.text, fontWeight: "900", fontSize: 15 },
  pill: { alignSelf: "flex-start", backgroundColor: "#E8F1F4", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { color: COLORS.navy2, fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  footer: { color: "#8A9AA1", fontSize: 10, fontWeight: "800", textAlign: "center", letterSpacing: 1.1, marginTop: 8 },
});
